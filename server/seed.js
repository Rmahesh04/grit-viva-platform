const { db, initializeSchema, runTransaction } = require('./db');

function seedDatabase() {
  console.log('🔄 Initializing NIAT GRIT Database Schema...');
  initializeSchema();

  console.log('🌱 Seeding Platform Data...');
  runTransaction(() => {
    // Clean existing tables in reverse dependency order
    db.exec(`
      DELETE FROM malpractice_audit_logs;
      DELETE FROM interview_evaluations;
      DELETE FROM interview_bookings;
      DELETE FROM interviewer_slots;
      DELETE FROM student_cleared_skills;
      DELETE FROM student_track_enrollments;
      DELETE FROM track_skills;
      DELETE FROM tracks;
      DELETE FROM users;
    `);

    // 1. Seed Users
    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, role, roll_number, headline, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Students
    insertUser.run('std_rahul', 'Rahul Verma', 'rahul.v@niatindia.com', 'STUDENT', 'NIAT23CS0104', '3rd Year B.Tech CSE (Full Stack Enthusiast)', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150');
    insertUser.run('std_ananya', 'Ananya Sen', 'ananya.s@niatindia.com', 'STUDENT', 'NIAT23CS0188', '3rd Year B.Tech IT (Backend Specialist)', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150');
    insertUser.run('std_karthik', 'Karthik Nair', 'karthik.n@niatindia.com', 'STUDENT', 'NIAT23CS0042', '4th Year B.Tech CSE (Cloud Architecture)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
    insertUser.run('std_sneha', 'Sneha Rao', 'sneha.r@niatindia.com', 'STUDENT', 'NIAT23CS0215', '3rd Year B.Tech AI&DS', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150');
    insertUser.run('std_vikram', 'Vikram Malhotra', 'vikram.m@niatindia.com', 'STUDENT', 'NIAT23CS0330', '4th Year B.Tech CSE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150');
    insertUser.run('std_rohit', 'Rohit Sharma', 'rohit.s@niatindia.com', 'STUDENT', 'NIAT23CS0501', '2nd Year B.Tech CSE (Aspiring Full Stack)', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150');

    // Interviewers
    insertUser.run('int_priya', 'Priya Sharma', 'priya.sharma@niatindia.com', 'INTERVIEWER', null, 'Staff Engineer & Viva Panelist @ NIAT', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150');
    insertUser.run('int_arjun', 'Arjun Mehta', 'arjun.mehta@niatindia.com', 'INTERVIEWER', null, 'Principal Architect & Technical Interview Lead', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150');

    // Admin
    insertUser.run('adm_grit_ops', 'Rajesh Kumar', 'rajesh.k@niatindia.com', 'ADMIN', null, 'Head of GRIT Operations & Academic Integrity', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150');

    // 2. Seed Tracks
    const insertTrack = db.prepare(`
      INSERT INTO tracks (id, code, name, badge_title, badge_description, total_skills_required, estimated_duration_months, icon_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTrack.run(
      'trk_fullstack',
      'FS_ENG',
      'Full Stack Web Engineering',
      'GRIT Certified Full Stack Engineer',
      'Demonstrated mastery across algorithmic problem solving, modern React application architectures, scalable backend APIs, relational database tuning, and automated container deployment.',
      5,
      6,
      'Code'
    );

    insertTrack.run(
      'trk_ai_sys',
      'AI_SYS',
      'Applied AI & Systems',
      'GRIT Certified AI Systems Engineer',
      'End-to-end expertise in vector retrieval, LLM prompt orchestration, model serving pipelines, and high-throughput inference backends.',
      4,
      5,
      'Cpu'
    );

    // 3. Seed Track Skills for Full Stack Track
    const insertSkill = db.prepare(`
      INSERT INTO track_skills (id, track_id, skill_code, skill_name, contest_name, cut_off_score, difficulty, sequence_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertSkill.run('sk_fs_01', 'trk_fullstack', 'DSA_HARD', 'DSA Benchmark Contest', 'NIAT Competitive Benchmark #4', 85, 'BENCHMARK', 1);
    insertSkill.run('sk_fs_02', 'trk_fullstack', 'REACT_PRO', 'Production React Architectures', 'Frontend Systems Sprint Contest', 80, 'ADVANCED', 2);
    insertSkill.run('sk_fs_03', 'trk_fullstack', 'API_SCALE', 'Scalable REST & Microservices', 'Distributed APIs Challenge', 80, 'ADVANCED', 3);
    insertSkill.run('sk_fs_04', 'trk_fullstack', 'SQL_ACID', 'RDBMS Indexing & Concurrency', 'Database Internals Contest', 80, 'INTERMEDIATE', 4);
    insertSkill.run('sk_fs_05', 'trk_fullstack', 'DOCKER_CI', 'Containerization & CI/CD Pipelines', 'Cloud Native DevOps Sprint', 75, 'INTERMEDIATE', 5);

    // 4. Seed Enrollments across all lifecycle stages
    const insertEnrollment = db.prepare(`
      INSERT INTO student_track_enrollments (
        id, student_id, track_id, cleared_skills_count, is_eligible, status,
        badge_credential_id, badge_awarded_at, badge_nullified_at, nullification_reason, retake_cooling_until, last_nudged_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Rahul: ELIGIBLE, cleared 5/5, needs to book viva
    insertEnrollment.run('enr_rahul', 'std_rahul', 'trk_fullstack', 5, 1, 'ELIGIBLE_PENDING_BOOKING', null, null, null, null, null, null);

    // Ananya: ELIGIBLE, cleared 5/5, already booked viva
    insertEnrollment.run('enr_ananya', 'std_ananya', 'trk_fullstack', 5, 1, 'SLOT_BOOKED', null, null, null, null, null, null);

    // Karthik: PASSED, badge awarded!
    insertEnrollment.run('enr_karthik', 'std_karthik', 'trk_fullstack', 5, 1, 'BADGE_AWARDED', 'GRIT-2026-FS-84920', '2026-11-10 16:30:00', null, null, null, null);

    // Sneha: RETAKE REQUIRED, cooling period active
    insertEnrollment.run('enr_sneha', 'std_sneha', 'trk_fullstack', 5, 1, 'VIVA_FAILED_RETAKE', null, null, null, null, '2026-11-20 23:59:59', null);

    // Vikram: BADGE NULLIFIED due to malpractice detected in post-award audit
    insertEnrollment.run('enr_vikram', 'std_vikram', 'trk_fullstack', 5, 1, 'BADGE_NULLIFIED_MALPRACTICE', 'GRIT-2026-FS-77104', '2026-11-05 14:00:00', '2026-11-11 11:20:00', 'Automated code similarity pipeline detected 94% AST overlap with uncredited external repository in Contest #4 submission.', null, null);

    // Rohit: IN PROGRESS, cleared 3/5 skills, not yet eligible
    insertEnrollment.run('enr_rohit', 'std_rohit', 'trk_fullstack', 3, 0, 'SKILLS_IN_PROGRESS', null, null, null, null, null, null);

    // 5. Seed Cleared Skills for Rahul (5/5)
    const insertCleared = db.prepare(`
      INSERT INTO student_cleared_skills (id, enrollment_id, skill_id, score_achieved, proctoring_session_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertCleared.run('cs_1', 'enr_rahul', 'sk_fs_01', 92, 'PROC-SESSION-4819');
    insertCleared.run('cs_2', 'enr_rahul', 'sk_fs_02', 88, 'PROC-SESSION-5102');
    insertCleared.run('cs_3', 'enr_rahul', 'sk_fs_03', 85, 'PROC-SESSION-5991');
    insertCleared.run('cs_4', 'enr_rahul', 'sk_fs_04', 90, 'PROC-SESSION-6304');
    insertCleared.run('cs_5', 'enr_rahul', 'sk_fs_05', 84, 'PROC-SESSION-7012');

    // 6. Seed Interviewer Slots
    const insertSlot = db.prepare(`
      INSERT INTO interviewer_slots (id, interviewer_id, track_id, slot_date, start_time, end_time, meeting_link, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Priya's slots (Tomorrow & Day After)
    insertSlot.run('slot_101', 'int_priya', 'trk_fullstack', '2026-11-13', '10:00 AM', '10:45 AM', 'https://meet.niatindia.com/viva-priya-101', 'BOOKED'); // Booked by Ananya
    insertSlot.run('slot_102', 'int_priya', 'trk_fullstack', '2026-11-13', '11:15 AM', '12:00 PM', 'https://meet.niatindia.com/viva-priya-102', 'AVAILABLE');
    insertSlot.run('slot_103', 'int_priya', 'trk_fullstack', '2026-11-13', '02:00 PM', '02:45 PM', 'https://meet.niatindia.com/viva-priya-103', 'AVAILABLE');
    insertSlot.run('slot_104', 'int_priya', 'trk_fullstack', '2026-11-13', '03:15 PM', '04:00 PM', 'https://meet.niatindia.com/viva-priya-104', 'AVAILABLE');
    insertSlot.run('slot_105', 'int_priya', 'trk_fullstack', '2026-11-14', '10:00 AM', '10:45 AM', 'https://meet.niatindia.com/viva-priya-105', 'AVAILABLE');
    insertSlot.run('slot_106', 'int_priya', 'trk_fullstack', '2026-11-14', '11:30 AM', '12:15 PM', 'https://meet.niatindia.com/viva-priya-106', 'AVAILABLE');

    // Arjun's slots
    insertSlot.run('slot_201', 'int_arjun', 'trk_fullstack', '2026-11-13', '04:30 PM', '05:15 PM', 'https://meet.niatindia.com/viva-arjun-201', 'AVAILABLE');
    insertSlot.run('slot_202', 'int_arjun', 'trk_fullstack', '2026-11-14', '02:00 PM', '02:45 PM', 'https://meet.niatindia.com/viva-arjun-202', 'AVAILABLE');
    insertSlot.run('slot_203', 'int_arjun', 'trk_fullstack', '2026-11-14', '03:30 PM', '04:15 PM', 'https://meet.niatindia.com/viva-arjun-203', 'AVAILABLE');

    // Completed slots from earlier
    insertSlot.run('slot_past_karthik', 'int_priya', 'trk_fullstack', '2026-11-10', '03:00 PM', '03:45 PM', 'https://meet.niatindia.com/viva-priya-past-1', 'COMPLETED');
    insertSlot.run('slot_past_sneha', 'int_arjun', 'trk_fullstack', '2026-11-09', '11:00 AM', '11:45 AM', 'https://meet.niatindia.com/viva-arjun-past-2', 'COMPLETED');

    // 7. Seed Bookings
    const insertBooking = db.prepare(`
      INSERT INTO interview_bookings (id, slot_id, enrollment_id, student_id, interviewer_id, track_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Ananya's active confirmed booking
    insertBooking.run('bk_ananya_01', 'slot_101', 'enr_ananya', 'std_ananya', 'int_priya', 'trk_fullstack', 'CONFIRMED');

    // Karthik's completed booking
    insertBooking.run('bk_karthik_past', 'slot_past_karthik', 'enr_karthik', 'std_karthik', 'int_priya', 'trk_fullstack', 'COMPLETED');

    // Sneha's completed booking (resulted in retake)
    insertBooking.run('bk_sneha_past', 'slot_past_sneha', 'enr_sneha', 'std_sneha', 'int_arjun', 'trk_fullstack', 'COMPLETED');

    // 8. Seed Evaluations
    const insertEval = db.prepare(`
      INSERT INTO interview_evaluations (
        id, booking_id, interviewer_id, student_id, outcome,
        score_system_design, score_problem_solving, score_code_quality, rubric_feedback, internal_ops_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEval.run(
      'eval_karthik',
      'bk_karthik_past',
      'int_priya',
      'std_karthik',
      'PASS',
      5, 5, 4,
      'Exemplary viva performance. Karthik demonstrated deep intuition on distributed cache invalidation strategies and concurrency isolation in PostgreSQL. Code organization in React was modular and clean. Strongly recommend Track Badge accreditation.',
      'Fast-track candidate for NIAT placement marquee partners.'
    );

    insertEval.run(
      'eval_sneha',
      'bk_sneha_past',
      'int_arjun',
      'std_sneha',
      'RETAKE_LATER',
      2, 4, 3,
      'Good baseline problem-solving and algorithmic approach, but struggled to explain how database connections pool in high-throughput Express services, and could not resolve race conditions in state updates. Recommended 10-day review period focusing on database locks and state management.',
      'Candidate needs practice with live architectural defense before re-attempting.'
    );

    // 9. Seed Malpractice Audit Log for Vikram
    const insertAudit = db.prepare(`
      INSERT INTO malpractice_audit_logs (
        id, enrollment_id, student_id, flagged_by_admin_id, violation_type, evidence_summary, revoked_credential_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertAudit.run(
      'mal_log_vikram',
      'enr_vikram',
      'std_vikram',
      'adm_grit_ops',
      'Plagiarism & External Code Ingestion',
      'Automated NIAT AST Code Similarity Engine flagged submission for Contest #4 (Database Concurrency) with a 94.2% match against an external GitHub solution submitted 3 hours prior by another account. Forensic inspection confirmed identical variable structures and commit hashing. Academic Integrity Board confirmed violation.',
      'GRIT-2026-FS-77104'
    );
  });

  console.log('✅ NIAT GRIT Platform Data Seeded Successfully!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };

