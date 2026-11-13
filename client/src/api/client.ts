import {
  UserRole,
  User,
  Enrollment,
  TrackSkill,
  ActiveBooking,
  Evaluation,
  MalpracticeAuditLog,
  InterviewerSlot,
  CohortStats
} from '../types/grit';

const API_BASE = '/api';

export interface SessionData {
  activeSession: {
    role: UserRole;
    studentId: string;
    interviewerId: string;
    adminId: string;
  };
  personas: {
    students: User[];
    interviewers: User[];
    admin: User;
  };
}

export interface StudentProfileData {
  student: User;
  enrollment: Enrollment;
  skills: TrackSkill[];
  activeBooking: ActiveBooking | null;
  evaluations: Evaluation[];
  malpracticeAudit: MalpracticeAuditLog | null;
}

export const api = {
  // Session & Persona
  async getSession(): Promise<SessionData> {
    const res = await fetch(`${API_BASE}/session`);
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async switchSession(params: { role?: UserRole; studentId?: string; interviewerId?: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/session/switch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to switch session');
  },

  // Student Portal
  async getStudentProfile(studentId?: string): Promise<StudentProfileData> {
    const url = studentId ? `${API_BASE}/students/profile?studentId=${studentId}` : `${API_BASE}/students/profile`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch student profile');
    return res.json();
  },

  async getAvailableSlots(trackId: string = 'trk_fullstack'): Promise<{ slots: InterviewerSlot[] }> {
    const res = await fetch(`${API_BASE}/slots/available?trackId=${trackId}`);
    if (!res.ok) throw new Error('Failed to fetch available slots');
    return res.json();
  },

  async bookSlot(params: { enrollmentId: string; slotId: string; studentId: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/slots/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to book slot');
    return data;
  },

  async cancelSlot(params: { bookingId: string; studentId: string; reason?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/slots/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel slot');
    return data;
  },

  // Interviewer Portal
  async getInterviewerSlots(interviewerId?: string): Promise<{ slots: InterviewerSlot[] }> {
    const url = interviewerId ? `${API_BASE}/interviewer/slots?interviewerId=${interviewerId}` : `${API_BASE}/interviewer/slots`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch interviewer slots');
    return res.json();
  },

  async createSlot(params: {
    interviewerId: string;
    trackId?: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    meetingLink?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/interviewer/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create slot');
    return data;
  },

  async deleteSlot(slotId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/interviewer/slots/${slotId}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete slot');
    return data;
  },

  async getInterviewerSchedule(interviewerId?: string): Promise<{ schedule: any[] }> {
    const url = interviewerId ? `${API_BASE}/interviewer/schedule?interviewerId=${interviewerId}` : `${API_BASE}/interviewer/schedule`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
  },

  async recordEvaluation(params: {
    bookingId: string;
    interviewerId: string;
    studentId: string;
    outcome: 'PASS' | 'RETAKE_LATER' | 'FAIL_UNFIT';
    scoreSystemDesign: number;
    scoreProblemSolving: number;
    scoreCodeQuality: number;
    rubricFeedback: string;
    internalNotes?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/interviews/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to record evaluation');
    return data;
  },

  // Admin Portal
  async getCohortFunnel(): Promise<{ stats: CohortStats; studentRoster: any[]; auditLogs: MalpracticeAuditLog[] }> {
    const res = await fetch(`${API_BASE}/admin/cohort-funnel`);
    if (!res.ok) throw new Error('Failed to fetch cohort data');
    return res.json();
  },

  async nudgeStudent(enrollmentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/nudge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enrollmentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send nudge');
    return data;
  },

  async flagMalpractice(params: {
    enrollmentId: string;
    studentId: string;
    adminId: string;
    violationType: string;
    evidenceSummary: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/malpractice/flag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to flag malpractice');
    return data;
  },

  async resetDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reset-demo`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset demo');
    return data;
  },

  // AI Product Intelligence APIs
  async getPreVivaDiagnostic(studentId?: string): Promise<any> {
    const url = studentId ? `${API_BASE}/ai/pre-viva-diagnostic?studentId=${studentId}` : `${API_BASE}/ai/pre-viva-diagnostic`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load AI diagnostic');
    return res.json();
  },

  async getInterviewerCopilot(studentId?: string): Promise<any> {
    const url = studentId ? `${API_BASE}/ai/interviewer-copilot?studentId=${studentId}` : `${API_BASE}/ai/interviewer-copilot`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load AI copilot');
    return res.json();
  },

  async synthesizeRubric(params: { studentName: string; scores: any; rawNotes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/synthesize-rubric`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to synthesize rubric');
    return data;
  },

  async getAIForensicReport(studentId?: string): Promise<any> {
    const url = studentId ? `${API_BASE}/ai/forensic-report?studentId=${studentId}` : `${API_BASE}/ai/forensic-report`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load forensic report');
    return res.json();
  },

  async getSmartNudge(params: { studentName: string; days?: number; trackName?: string }): Promise<any> {
    const query = new URLSearchParams({
      studentName: params.studentName,
      days: String(params.days || 2),
      trackName: params.trackName || 'Full Stack Track'
    });
    const res = await fetch(`${API_BASE}/ai/smart-nudge?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to generate smart nudge');
    return res.json();
  }
};

