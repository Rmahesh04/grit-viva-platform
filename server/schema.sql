-- ==============================================================================
-- NIAT GRIT Platform: Track Badge Viva Scheduling & Lifecycle Schema
-- Database: SQLite 3 / Embedded ACID Engine
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table (Students, Interviewers, NIAT Admins)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('STUDENT', 'INTERVIEWER', 'ADMIN')),
    roll_number TEXT UNIQUE, -- NIAT Student ID (e.g., NIAT23CS0104)
    headline TEXT,          -- e.g. "Year 3 - CSE" or "Senior Software Engineer @ NIAT"
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tracks Table (GRIT Track Badges)
CREATE TABLE IF NOT EXISTS tracks (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL, -- e.g. FS_ENG, AI_SYS, CLOUD_DEV
    name TEXT NOT NULL,
    badge_title TEXT NOT NULL,
    badge_description TEXT NOT NULL,
    total_skills_required INTEGER NOT NULL,
    estimated_duration_months INTEGER DEFAULT 6,
    icon_name TEXT DEFAULT 'Code'
);

-- 3. Track Skills (The prerequisite skill contests a student must clear)
CREATE TABLE IF NOT EXISTS track_skills (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    skill_code TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    contest_name TEXT NOT NULL,
    cut_off_score INTEGER NOT NULL DEFAULT 80,
    difficulty TEXT CHECK(difficulty IN ('FOUNDATIONAL', 'INTERMEDIATE', 'ADVANCED', 'BENCHMARK')),
    sequence_order INTEGER NOT NULL,
    UNIQUE(track_id, skill_code)
);

-- 4. Student Track Enrollments (The core lifecycle state machine)
CREATE TABLE IF NOT EXISTS student_track_enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    cleared_skills_count INTEGER NOT NULL DEFAULT 0,
    is_eligible INTEGER NOT NULL DEFAULT 0, -- 1 when cleared_skills_count >= total_skills_required
    status TEXT NOT NULL DEFAULT 'SKILLS_IN_PROGRESS' CHECK(
        status IN (
            'SKILLS_IN_PROGRESS',
            'ELIGIBLE_PENDING_BOOKING',
            'SLOT_BOOKED',
            'VIVA_PENDING_EVALUATION',
            'BADGE_AWARDED',
            'VIVA_FAILED_RETAKE',
            'BADGE_NULLIFIED_MALPRACTICE'
        )
    ),
    badge_credential_id TEXT UNIQUE, -- Issued on PASS (e.g., GRIT-2026-FS-84920)
    badge_awarded_at DATETIME,
    badge_nullified_at DATETIME,
    nullification_reason TEXT,
    retake_cooling_until DATETIME,    -- Cooldown window before retake booking allowed
    last_nudged_at DATETIME,          -- For admin tracking of reminders
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, track_id)
);

-- 5. Student Cleared Skills Audit
CREATE TABLE IF NOT EXISTS student_cleared_skills (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT NOT NULL REFERENCES student_track_enrollments(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES track_skills(id) ON DELETE CASCADE,
    score_achieved INTEGER NOT NULL,
    cleared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    proctoring_session_id TEXT,
    UNIQUE(enrollment_id, skill_id)
);

-- 6. Interviewer Availability Slots
CREATE TABLE IF NOT EXISTS interviewer_slots (
    id TEXT PRIMARY KEY,
    interviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    slot_date TEXT NOT NULL, -- Format: YYYY-MM-DD
    start_time TEXT NOT NULL, -- Format: HH:MM (24h)
    end_time TEXT NOT NULL,   -- Format: HH:MM (24h)
    meeting_link TEXT NOT NULL DEFAULT 'https://meet.niatindia.com/grit-viva-room',
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'BOOKED', 'CANCELLED', 'COMPLETED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Interview Bookings (Guarantees one booking per slot via UNIQUE constraint)
CREATE TABLE IF NOT EXISTS interview_bookings (
    id TEXT PRIMARY KEY,
    slot_id TEXT UNIQUE NOT NULL REFERENCES interviewer_slots(id) ON DELETE RESTRICT,
    enrollment_id TEXT NOT NULL REFERENCES student_track_enrollments(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK(status IN ('CONFIRMED', 'COMPLETED', 'STUDENT_NO_SHOW', 'INTERVIEWER_NO_SHOW', 'CANCELLED')),
    cancellation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Interview Viva Evaluations & Rubrics
CREATE TABLE IF NOT EXISTS interview_evaluations (
    id TEXT PRIMARY KEY,
    booking_id TEXT UNIQUE NOT NULL REFERENCES interview_bookings(id) ON DELETE CASCADE,
    interviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL CHECK(outcome IN ('PASS', 'RETAKE_LATER', 'FAIL_UNFIT')),
    score_system_design INTEGER NOT NULL CHECK(score_system_design BETWEEN 1 AND 5),
    score_problem_solving INTEGER NOT NULL CHECK(score_problem_solving BETWEEN 1 AND 5),
    score_code_quality INTEGER NOT NULL CHECK(score_code_quality BETWEEN 1 AND 5),
    rubric_feedback TEXT NOT NULL,
    internal_ops_notes TEXT,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Malpractice Audit Trail & Revocation Logs
CREATE TABLE IF NOT EXISTS malpractice_audit_logs (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT NOT NULL REFERENCES student_track_enrollments(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flagged_by_admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    violation_type TEXT NOT NULL, -- e.g. "Automated Plagiarism Match > 85%", "Proctoring Impersonation"
    evidence_summary TEXT NOT NULL,
    revoked_credential_id TEXT NOT NULL,
    flagged_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast lookups & operations queries
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON student_track_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_slots_date_status ON interviewer_slots(slot_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON interview_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_bookings_interviewer ON interview_bookings(interviewer_id);

