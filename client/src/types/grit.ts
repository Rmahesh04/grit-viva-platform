export type UserRole = 'STUDENT' | 'INTERVIEWER' | 'ADMIN';

export type EnrollmentStatus =
  | 'SKILLS_IN_PROGRESS'
  | 'ELIGIBLE_PENDING_BOOKING'
  | 'SLOT_BOOKED'
  | 'VIVA_PENDING_EVALUATION'
  | 'BADGE_AWARDED'
  | 'VIVA_FAILED_RETAKE'
  | 'BADGE_NULLIFIED_MALPRACTICE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roll_number?: string;
  headline?: string;
  avatar_url?: string;
  enrollment_status?: EnrollmentStatus;
  is_eligible?: number;
  badge_credential_id?: string;
}

export interface Track {
  id: string;
  code: string;
  name: string;
  badge_title: string;
  badge_description: string;
  total_skills_required: number;
  estimated_duration_months: number;
}

export interface TrackSkill {
  id: string;
  track_id: string;
  skill_code: string;
  skill_name: string;
  contest_name: string;
  cut_off_score: number;
  difficulty: 'FOUNDATIONAL' | 'INTERMEDIATE' | 'ADVANCED' | 'BENCHMARK';
  sequence_order: number;
  score_achieved?: number;
  cleared_at?: string;
  is_cleared: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  track_id: string;
  track_name: string;
  badge_title: string;
  badge_description: string;
  cleared_skills_count: number;
  total_skills_required: number;
  is_eligible: number;
  status: EnrollmentStatus;
  badge_credential_id?: string;
  badge_awarded_at?: string;
  badge_nullified_at?: string;
  nullification_reason?: string;
  retake_cooling_until?: string;
  last_nudged_at?: string;
}

export interface InterviewerSlot {
  id: string;
  interviewer_id: string;
  interviewer_name?: string;
  interviewer_headline?: string;
  interviewer_avatar?: string;
  track_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'COMPLETED';
  booking_id?: string;
  student_name?: string;
  student_roll?: string;
  student_email?: string;
}

export interface ActiveBooking {
  booking_id: string;
  booking_status: string;
  booked_at: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  interviewer_name: string;
  interviewer_headline: string;
  interviewer_avatar: string;
}

export interface Evaluation {
  id: string;
  booking_id: string;
  interviewer_id: string;
  interviewer_name: string;
  student_id: string;
  outcome: 'PASS' | 'RETAKE_LATER' | 'FAIL_UNFIT';
  score_system_design: number;
  score_problem_solving: number;
  score_code_quality: number;
  rubric_feedback: string;
  internal_ops_notes?: string;
  evaluated_at: string;
  slot_date?: string;
  start_time?: string;
}

export interface MalpracticeAuditLog {
  id: string;
  enrollment_id: string;
  student_id: string;
  student_name?: string;
  student_roll?: string;
  flagged_by_admin_id: string;
  admin_name: string;
  violation_type: string;
  evidence_summary: string;
  revoked_credential_id: string;
  flagged_at: string;
}

export interface CohortStats {
  total_students: number;
  total_eligible: number;
  eligible_unbooked: number;
  slot_booked: number;
  badges_awarded: number;
  retake_required: number;
  badges_nullified: number;
}

