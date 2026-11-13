const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { db, runTransaction } = require('./db');
const { seedDatabase } = require('./seed');
const aiEngine = require('./ai-engine');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory active persona state for interactive demo switcher
let activeSession = {
  role: 'STUDENT',
  studentId: 'std_rahul',
  interviewerId: 'int_priya',
  adminId: 'adm_grit_ops'
};

// ==============================================================================
// 1. SESSION & PERSONA SWITCHING APIS
// ==============================================================================

app.get('/api/session', (req, res) => {
  const students = db.prepare(`
    SELECT u.id, u.name, u.email, u.roll_number, u.headline, u.avatar_url,
           e.status as enrollment_status, e.is_eligible, e.badge_credential_id
    FROM users u
    LEFT JOIN student_track_enrollments e ON e.student_id = u.id
    WHERE u.role = 'STUDENT'
    ORDER BY u.id
  `).all();

  const interviewers = db.prepare(`
    SELECT id, name, email, headline, avatar_url
    FROM users
    WHERE role = 'INTERVIEWER'
  `).all();

  const admin = db.prepare(`
    SELECT id, name, email, headline, avatar_url
    FROM users
    WHERE role = 'ADMIN'
    LIMIT 1
  `).get();

  res.json({
    activeSession,
    personas: {
      students,
      interviewers,
      admin
    }
  });
});

app.post('/api/session/switch', (req, res) => {
  const { role, studentId, interviewerId } = req.body;
  if (role) activeSession.role = role;
  if (studentId) activeSession.studentId = studentId;
  if (interviewerId) activeSession.interviewerId = interviewerId;
  res.json({ success: true, activeSession });
});

// ==============================================================================
// 2. STUDENT PORTAL APIS
// ==============================================================================

app.get('/api/students/profile', (req, res) => {
  const studentId = req.query.studentId || activeSession.studentId;

  const student = db.prepare(`
    SELECT id, name, email, roll_number, headline, avatar_url
    FROM users
    WHERE id = ? AND role = 'STUDENT'
  `).get(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  // Get track enrollment
  const enrollment = db.prepare(`
    SELECT e.*, t.name as track_name, t.badge_title, t.badge_description, t.total_skills_required
    FROM student_track_enrollments e
    JOIN tracks t ON t.id = e.track_id
    WHERE e.student_id = ?
    LIMIT 1
  `).get(studentId);

  // Get skills and cleared status
  let skills = [];
  if (enrollment) {
    skills = db.prepare(`
      SELECT s.*, cs.score_achieved, cs.cleared_at,
             CASE WHEN cs.id IS NOT NULL THEN 1 ELSE 0 END as is_cleared
      FROM track_skills s
      LEFT JOIN student_cleared_skills cs ON cs.skill_id = s.id AND cs.enrollment_id = ?
      WHERE s.track_id = ?
      ORDER BY s.sequence_order
    `).all(enrollment.id, enrollment.track_id);
  }

  // Active confirmed booking
  let activeBooking = null;
  if (enrollment) {
    activeBooking = db.prepare(`
      SELECT b.id as booking_id, b.status as booking_status, b.created_at as booked_at,
             s.slot_date, s.start_time, s.end_time, s.meeting_link,
             u.name as interviewer_name, u.headline as interviewer_headline, u.avatar_url as interviewer_avatar
      FROM interview_bookings b
      JOIN interviewer_slots s ON s.id = b.slot_id
      JOIN users u ON u.id = b.interviewer_id
      WHERE b.student_id = ? AND b.status = 'CONFIRMED'
      ORDER BY b.created_at DESC
      LIMIT 1
    `).get(studentId);
  }

  // Past evaluations
  const evaluations = db.prepare(`
    SELECT ev.*, u.name as interviewer_name, s.slot_date, s.start_time
    FROM interview_evaluations ev
    JOIN interview_bookings b ON b.id = ev.booking_id
    JOIN interviewer_slots s ON s.id = b.slot_id
    JOIN users u ON u.id = ev.interviewer_id
    WHERE ev.student_id = ?
    ORDER BY ev.evaluated_at DESC
  `).all(studentId);

  // Malpractice logs
  const malpracticeAudit = db.prepare(`
    SELECT m.*, u.name as admin_name
    FROM malpractice_audit_logs m
    JOIN users u ON u.id = m.flagged_by_admin_id
    WHERE m.student_id = ?
    ORDER BY m.flagged_at DESC
    LIMIT 1
  `).get(studentId);

  res.json({
    student,
    enrollment,
    skills,
    activeBooking,
    evaluations,
    malpracticeAudit
  });
});

// Available slots for students to book
app.get('/api/slots/available', (req, res) => {
  const trackId = req.query.trackId || 'trk_fullstack';

  const slots = db.prepare(`
    SELECT s.id, s.slot_date, s.start_time, s.end_time, s.meeting_link, s.status,
           u.id as interviewer_id, u.name as interviewer_name, u.headline as interviewer_headline, u.avatar_url as interviewer_avatar
    FROM interviewer_slots s
    JOIN users u ON u.id = s.interviewer_id
    WHERE s.track_id = ? AND s.status = 'AVAILABLE'
    ORDER BY s.slot_date ASC, s.start_time ASC
  `).all(trackId);

  res.json({ slots });
});

// Book an interview slot (Atomic transaction with strict validation)
app.post('/api/slots/book', (req, res) => {
  const { enrollmentId, slotId, studentId } = req.body;

  if (!enrollmentId || !slotId || !studentId) {
    return res.status(400).json({ error: 'Missing required parameters (enrollmentId, slotId, studentId)' });
  }

  try {
    const booking = runTransaction(() => {
      // 1. Verify student eligibility and status
      const enrollment = db.prepare(`
        SELECT * FROM student_track_enrollments WHERE id = ? AND student_id = ?
      `).get(enrollmentId, studentId);

      if (!enrollment) {
        throw new Error('Enrollment record not found');
      }

      if (enrollment.is_eligible !== 1) {
        throw new Error('Student has not cleared all prerequisite skills yet.');
      }

      if (enrollment.status === 'BADGE_AWARDED') {
        throw new Error('Student has already earned this Track Badge.');
      }

      if (enrollment.status === 'BADGE_NULLIFIED_MALPRACTICE') {
        throw new Error('Student is flagged for malpractice and barred from viva booking.');
      }

      if (enrollment.status === 'SLOT_BOOKED') {
        throw new Error('Student already has an active confirmed viva booking.');
      }

      // Check retake cooldown if applicable
      if (enrollment.retake_cooling_until) {
        const coolingDate = new Date(enrollment.retake_cooling_until);
        if (new Date() < coolingDate) {
          throw new Error(`Retake cooling period active until ${coolingDate.toLocaleDateString()}. Please complete recommended practice first.`);
        }
      }

      // 2. Lock and verify slot availability
      const slot = db.prepare(`
        SELECT * FROM interviewer_slots WHERE id = ?
      `).get(slotId);

      if (!slot || slot.status !== 'AVAILABLE') {
        throw new Error('The selected slot has just been reserved by another candidate. Please pick another slot.');
      }

      // 3. Mark slot as BOOKED
      db.prepare(`
        UPDATE interviewer_slots SET status = 'BOOKED' WHERE id = ?
      `).run(slotId);

      // 4. Create interview booking record
      const bookingId = `bk_${Date.now()}`;
      db.prepare(`
        INSERT INTO interview_bookings (id, slot_id, enrollment_id, student_id, interviewer_id, track_id, status)
        VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
      `).run(bookingId, slotId, enrollmentId, studentId, slot.interviewer_id, slot.track_id);

      // 5. Update enrollment lifecycle state
      db.prepare(`
        UPDATE student_track_enrollments
        SET status = 'SLOT_BOOKED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(enrollmentId);

      return { bookingId, slotId, interviewerId: slot.interviewer_id, date: slot.slot_date, time: slot.start_time };
    });

    res.json({ success: true, message: 'Viva slot successfully booked and confirmed.', booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Cancel active booking
app.post('/api/slots/cancel', (req, res) => {
  const { bookingId, studentId, reason } = req.body;

  try {
    runTransaction(() => {
      const booking = db.prepare(`
        SELECT * FROM interview_bookings WHERE id = ? AND student_id = ? AND status = 'CONFIRMED'
      `).get(bookingId, studentId);

      if (!booking) {
        throw new Error('Active booking not found.');
      }

      // Free slot
      db.prepare(`
        UPDATE interviewer_slots SET status = 'AVAILABLE' WHERE id = ?
      `).run(booking.slot_id);

      // Cancel booking
      db.prepare(`
        UPDATE interview_bookings SET status = 'CANCELLED', cancellation_reason = ? WHERE id = ?
      `).run(reason || 'Cancelled by student', bookingId);

      // Revert enrollment status
      db.prepare(`
        UPDATE student_track_enrollments
        SET status = 'ELIGIBLE_PENDING_BOOKING', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(booking.enrollment_id);
    });

    res.json({ success: true, message: 'Booking cancelled. Slot released.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==============================================================================
// 3. INTERVIEWER PORTAL APIS
// ==============================================================================

app.get('/api/interviewer/slots', (req, res) => {
  const interviewerId = req.query.interviewerId || activeSession.interviewerId;

  const slots = db.prepare(`
    SELECT s.*, b.id as booking_id, b.status as booking_status,
           u.name as student_name, u.roll_number as student_roll, u.email as student_email
    FROM interviewer_slots s
    LEFT JOIN interview_bookings b ON b.slot_id = s.id AND b.status = 'CONFIRMED'
    LEFT JOIN users u ON u.id = b.student_id
    WHERE s.interviewer_id = ?
    ORDER BY s.slot_date ASC, s.start_time ASC
  `).all(interviewerId);

  res.json({ slots });
});

app.post('/api/interviewer/slots', (req, res) => {
  const { interviewerId, trackId, slotDate, startTime, endTime, meetingLink } = req.body;

  if (!interviewerId || !slotDate || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing slot details.' });
  }

  const slotId = `slot_${Date.now()}`;
  db.prepare(`
    INSERT INTO interviewer_slots (id, interviewer_id, track_id, slot_date, start_time, end_time, meeting_link, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
  `).run(
    slotId,
    interviewerId,
    trackId || 'trk_fullstack',
    slotDate,
    startTime,
    endTime,
    meetingLink || 'https://meet.niatindia.com/grit-viva-room'
  );

  res.json({ success: true, slotId, message: 'Availability slot created successfully.' });
});

app.delete('/api/interviewer/slots/:id', (req, res) => {
  const slotId = req.params.id;

  const slot = db.prepare(`SELECT * FROM interviewer_slots WHERE id = ?`).get(slotId);
  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }

  if (slot.status === 'BOOKED') {
    return res.status(400).json({ error: 'Cannot delete a booked slot. Cancel the booking first.' });
  }

  db.prepare(`DELETE FROM interviewer_slots WHERE id = ?`).run(slotId);
  res.json({ success: true, message: 'Slot removed.' });
});

// Interviewer daily viva roster (upcoming sessions with student dossier)
app.get('/api/interviewer/schedule', (req, res) => {
  const interviewerId = req.query.interviewerId || activeSession.interviewerId;

  const schedule = db.prepare(`
    SELECT b.id as booking_id, b.status as booking_status,
           s.id as slot_id, s.slot_date, s.start_time, s.end_time, s.meeting_link,
           u.id as student_id, u.name as student_name, u.roll_number as student_roll, u.email as student_email, u.headline as student_headline, u.avatar_url as student_avatar,
           e.id as enrollment_id, e.cleared_skills_count, e.status as enrollment_status,
           t.name as track_name, t.badge_title,
           ev.id as evaluation_id, ev.outcome as evaluation_outcome
    FROM interview_bookings b
    JOIN interviewer_slots s ON s.id = b.slot_id
    JOIN users u ON u.id = b.student_id
    JOIN student_track_enrollments e ON e.id = b.enrollment_id
    JOIN tracks t ON t.id = b.track_id
    LEFT JOIN interview_evaluations ev ON ev.booking_id = b.id
    WHERE b.interviewer_id = ?
    ORDER BY s.slot_date ASC, s.start_time ASC
  `).all(interviewerId);

  res.json({ schedule });
});

// Record viva outcome (Pass, Retake Later, Fail)
app.post('/api/interviews/evaluate', (req, res) => {
  const {
    bookingId,
    interviewerId,
    studentId,
    outcome,
    scoreSystemDesign,
    scoreProblemSolving,
    scoreCodeQuality,
    rubricFeedback,
    internalNotes
  } = req.body;

  if (!bookingId || !outcome || !rubricFeedback) {
    return res.status(400).json({ error: 'Missing evaluation data.' });
  }

  try {
    const result = runTransaction(() => {
      const booking = db.prepare(`SELECT * FROM interview_bookings WHERE id = ?`).get(bookingId);
      if (!booking) throw new Error('Booking not found');

      // 1. Mark booking and slot as COMPLETED
      db.prepare(`UPDATE interview_bookings SET status = 'COMPLETED' WHERE id = ?`).run(bookingId);
      db.prepare(`UPDATE interviewer_slots SET status = 'COMPLETED' WHERE id = ?`).run(booking.slot_id);

      // 2. Insert evaluation record
      const evalId = `eval_${Date.now()}`;
      db.prepare(`
        INSERT INTO interview_evaluations (
          id, booking_id, interviewer_id, student_id, outcome,
          score_system_design, score_problem_solving, score_code_quality, rubric_feedback, internal_ops_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        evalId,
        bookingId,
        interviewerId,
        studentId,
        outcome,
        scoreSystemDesign || 4,
        scoreProblemSolving || 4,
        scoreCodeQuality || 4,
        rubricFeedback,
        internalNotes || null
      );

      // 3. Update student enrollment lifecycle
      if (outcome === 'PASS') {
        const credentialId = `GRIT-2026-FS-${Math.floor(10000 + Math.random() * 90000)}`;
        db.prepare(`
          UPDATE student_track_enrollments
          SET status = 'BADGE_AWARDED',
              badge_credential_id = ?,
              badge_awarded_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(credentialId, booking.enrollment_id);
      } else if (outcome === 'RETAKE_LATER') {
        // Cooldown period: 10 days from now
        const cooldownDate = new Date();
        cooldownDate.setDate(cooldownDate.getDate() + 10);
        const cooldownStr = cooldownDate.toISOString().replace('T', ' ').substring(0, 19);

        db.prepare(`
          UPDATE student_track_enrollments
          SET status = 'VIVA_FAILED_RETAKE',
              retake_cooling_until = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(cooldownStr, booking.enrollment_id);
      } else {
        db.prepare(`
          UPDATE student_track_enrollments
          SET status = 'SKILLS_IN_PROGRESS',
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(booking.enrollment_id);
      }

      return { evalId, outcome };
    });

    res.json({ success: true, message: `Viva outcome recorded: ${outcome}`, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==============================================================================
// 4. ADMIN & NIAT OPERATIONS PORTAL APIS
// ==============================================================================

app.get('/api/admin/cohort-funnel', (req, res) => {
  // Aggregate counts
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_students,
      SUM(CASE WHEN is_eligible = 1 THEN 1 ELSE 0 END) as total_eligible,
      SUM(CASE WHEN status = 'ELIGIBLE_PENDING_BOOKING' THEN 1 ELSE 0 END) as eligible_unbooked,
      SUM(CASE WHEN status = 'SLOT_BOOKED' THEN 1 ELSE 0 END) as slot_booked,
      SUM(CASE WHEN status = 'BADGE_AWARDED' THEN 1 ELSE 0 END) as badges_awarded,
      SUM(CASE WHEN status = 'VIVA_FAILED_RETAKE' THEN 1 ELSE 0 END) as retake_required,
      SUM(CASE WHEN status = 'BADGE_NULLIFIED_MALPRACTICE' THEN 1 ELSE 0 END) as badges_nullified
    FROM student_track_enrollments
  `).get();

  // Full roster with booking status and nudge dates
  const studentRoster = db.prepare(`
    SELECT u.id as student_id, u.name, u.email, u.roll_number, u.headline, u.avatar_url,
           e.id as enrollment_id, e.status, e.is_eligible, e.cleared_skills_count, e.total_skills_required,
           e.badge_credential_id, e.badge_awarded_at, e.badge_nullified_at, e.nullification_reason,
           e.last_nudged_at, e.retake_cooling_until,
           b.id as active_booking_id, s.slot_date, s.start_time, inv.name as interviewer_name
    FROM student_track_enrollments e
    JOIN users u ON u.id = e.student_id
    JOIN tracks t ON t.id = e.track_id
    LEFT JOIN interview_bookings b ON b.enrollment_id = e.id AND b.status = 'CONFIRMED'
    LEFT JOIN interviewer_slots s ON s.id = b.slot_id
    LEFT JOIN users inv ON inv.id = b.interviewer_id
    ORDER BY
      CASE
        WHEN e.status = 'ELIGIBLE_PENDING_BOOKING' THEN 1
        WHEN e.status = 'SLOT_BOOKED' THEN 2
        WHEN e.status = 'VIVA_FAILED_RETAKE' THEN 3
        WHEN e.status = 'BADGE_AWARDED' THEN 4
        WHEN e.status = 'BADGE_NULLIFIED_MALPRACTICE' THEN 5
        ELSE 6
      END,
      u.name ASC
  `).all();

  // Malpractice audit log
  const auditLogs = db.prepare(`
    SELECT m.*, u.name as student_name, u.roll_number as student_roll, adm.name as admin_name
    FROM malpractice_audit_logs m
    JOIN users u ON u.id = m.student_id
    JOIN users adm ON adm.id = m.flagged_by_admin_id
    ORDER BY m.flagged_at DESC
  `).all();

  res.json({ stats, studentRoster, auditLogs });
});

// Admin sends nudge to eligible student who hasn't booked
app.post('/api/admin/nudge', (req, res) => {
  const { enrollmentId } = req.body;
  db.prepare(`
    UPDATE student_track_enrollments
    SET last_nudged_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(enrollmentId);

  res.json({ success: true, message: 'Automated booking reminder sent to student.' });
});

// Admin flags student for malpractice & nullifies badge
app.post('/api/admin/malpractice/flag', (req, res) => {
  const { enrollmentId, studentId, adminId, violationType, evidenceSummary } = req.body;

  if (!enrollmentId || !studentId || !evidenceSummary) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  try {
    runTransaction(() => {
      const enrollment = db.prepare(`SELECT * FROM student_track_enrollments WHERE id = ?`).get(enrollmentId);
      if (!enrollment) throw new Error('Enrollment not found');

      const revokedCredential = enrollment.badge_credential_id || 'PENDING_REVOCATION';

      // 1. Update enrollment status to BADGE_NULLIFIED_MALPRACTICE
      db.prepare(`
        UPDATE student_track_enrollments
        SET status = 'BADGE_NULLIFIED_MALPRACTICE',
            badge_nullified_at = CURRENT_TIMESTAMP,
            nullification_reason = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(evidenceSummary, enrollmentId);

      // 2. Insert into audit trail
      const logId = `mal_${Date.now()}`;
      db.prepare(`
        INSERT INTO malpractice_audit_logs (
          id, enrollment_id, student_id, flagged_by_admin_id, violation_type, evidence_summary, revoked_credential_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        logId,
        enrollmentId,
        studentId,
        adminId || activeSession.adminId,
        violationType || 'Academic Integrity Contest Plagiarism Violation',
        evidenceSummary,
        revokedCredential
      );
    });

    res.json({ success: true, message: 'Student flagged for malpractice. Track Badge immediately nullified.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reset demo database to clean initial state
app.post('/api/admin/reset-demo', (req, res) => {
  seedDatabase();
  res.json({ success: true, message: 'Database reset to initial demo seeds.' });
});

// ==============================================================================
// 5. AI PRODUCT ENGINEER INTELLIGENCE APIS
// ==============================================================================

app.get('/api/ai/pre-viva-diagnostic', (req, res) => {
  const studentId = req.query.studentId || activeSession.studentId;
  const diagnostic = aiEngine.getStudentAIDiagnostic(studentId);
  res.json({ success: true, diagnostic });
});

app.get('/api/ai/interviewer-copilot', (req, res) => {
  const studentId = req.query.studentId || activeSession.studentId;
  const copilot = aiEngine.getInterviewerAICopilot(studentId);
  res.json({ success: true, copilot });
});

app.post('/api/ai/synthesize-rubric', (req, res) => {
  const { studentName, scores, rawNotes } = req.body;
  const synthesis = aiEngine.synthesizeRubric(studentName || 'Candidate', scores || { systemDesign: 4, problemSolving: 4, codeQuality: 4 }, rawNotes || '');
  res.json({ success: true, synthesis });
});

app.get('/api/ai/forensic-report', (req, res) => {
  const studentId = req.query.studentId || activeSession.studentId;
  const report = aiEngine.getAIForensicReport(studentId);
  res.json({ success: true, report });
});

app.get('/api/ai/smart-nudge', (req, res) => {
  const { studentName, days, trackName } = req.query;
  const nudge = aiEngine.generateSmartNudge(studentName || 'Student', parseInt(days) || 2, trackName || 'Full Stack Track');
  res.json({ success: true, nudge });
});

// Serve compiled frontend in production
const clientDistPath = path.join(__dirname, '../client/dist');
if (require('node:fs').existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 NIAT GRIT Viva Scheduling API running on http://localhost:${PORT}`);
});
