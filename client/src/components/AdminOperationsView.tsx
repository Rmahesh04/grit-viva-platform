import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Award,
  ChevronRight,
  Send,
  Fingerprint,
  Sparkles,
  Bot
} from 'lucide-react';
import { api } from '../api/client';
import { CohortStats, MalpracticeAuditLog } from '../types/grit';
import { MalpracticeAuditModal } from './MalpracticeAuditModal';
import { AIForensicInspectorModal } from './AIForensicInspectorModal';

interface AdminOperationsViewProps {
  adminId: string;
  adminName: string;
}

export const AdminOperationsView: React.FC<AdminOperationsViewProps> = ({
  adminId,
  adminName
}) => {
  const [stats, setStats] = useState<CohortStats | null>(null);
  const [studentRoster, setStudentRoster] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<MalpracticeAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidateForMalpractice, setSelectedCandidateForMalpractice] = useState<any | null>(null);
  const [selectedCandidateForForensics, setSelectedCandidateForForensics] = useState<any | null>(null);
  const [nudgeSuccessMap, setNudgeSuccessMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getCohortFunnel();
      setStats(res.stats);
      setStudentRoster(res.studentRoster);
      setAuditLogs(res.auditLogs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNudge = async (enrollmentId: string, studentName: string) => {
    try {
      await api.nudgeStudent(enrollmentId);
      setNudgeSuccessMap(prev => ({ ...prev, [enrollmentId]: true }));
      setTimeout(() => {
        setNudgeSuccessMap(prev => ({ ...prev, [enrollmentId]: false }));
      }, 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to send nudge');
    }
  };

  const filteredStudents = studentRoster.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterState === 'ALL') return true;
    if (filterState === 'ELIGIBLE_UNBOOKED') return s.status === 'ELIGIBLE_PENDING_BOOKING';
    if (filterState === 'BOOKED') return s.status === 'SLOT_BOOKED';
    if (filterState === 'AWARDED') return s.status === 'BADGE_AWARDED';
    if (filterState === 'RETAKE') return s.status === 'VIVA_FAILED_RETAKE';
    if (filterState === 'NULLIFIED') return s.status === 'BADGE_NULLIFIED_MALPRACTICE';

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="luxe-panel p-8 rounded-4xl flex items-center justify-between flex-wrap gap-4 shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="p-3.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl shadow-lg">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-extrabold text-white tracking-tight">
                NIAT GRIT Operations & Viva Command Center
              </h1>
              <span className="px-3 py-1 text-xs bg-white/[0.06] text-emerald-300 font-mono font-extrabold rounded-full border border-white/[0.1]">
                {adminName} (Lead)
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Real-time conversion tracking: which eligible candidates have booked vs. unbooked drop-offs, with AI AST code similarity audits.
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/[0.08] transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Funnel</span>
        </button>
      </div>

      {/* Funnel Metric Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5">
          {/* Total Eligible */}
          <div className="luxe-panel p-5 rounded-3xl space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Eligible for Viva</div>
            <div className="text-3xl font-display font-black text-white">{stats.total_eligible}</div>
            <div className="text-xs text-slate-500">Cleared 5/5 Skills</div>
          </div>

          {/* Booked */}
          <div className="luxe-panel p-5 rounded-3xl space-y-1 border-indigo-500/30">
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Slot Booked</div>
            <div className="text-3xl font-display font-black text-indigo-400">{stats.slot_booked}</div>
            <div className="text-xs text-slate-500">Scheduled for viva</div>
          </div>

          {/* Eligible but UNBOOKED (Critical Feature requirement!) */}
          <div className="p-5 rounded-3xl space-y-1 bg-amber-500/10 border border-amber-500/40 ring-1 ring-amber-500/30">
            <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>Unbooked Drop-off</span>
              <Bell className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="text-3xl font-display font-black text-amber-400">{stats.eligible_unbooked}</div>
            <div className="text-xs text-amber-300/80">Need booking nudge</div>
          </div>

          {/* Badges Awarded */}
          <div className="luxe-panel p-5 rounded-3xl space-y-1 border-emerald-500/30">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Badges Minted</div>
            <div className="text-3xl font-display font-black text-emerald-400">{stats.badges_awarded}</div>
            <div className="text-xs text-slate-500">Accredited graduates</div>
          </div>

          {/* Retakes Required */}
          <div className="luxe-panel p-5 rounded-3xl space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Retakes Cooldown</div>
            <div className="text-3xl font-display font-black text-yellow-400">{stats.retake_required}</div>
            <div className="text-xs text-slate-500">In 10-day review</div>
          </div>

          {/* Nullified Malpractice */}
          <div className="p-5 rounded-3xl space-y-1 bg-rose-500/10 border border-rose-500/30">
            <div className="text-[11px] font-black text-rose-400 uppercase tracking-wider">Nullified</div>
            <div className="text-3xl font-display font-black text-rose-400">{stats.badges_nullified}</div>
            <div className="text-xs text-rose-400/80">Malpractice audits</div>
          </div>
        </div>
      )}

      {/* Cohort Tracker & Filter Controls */}
      <div className="luxe-panel p-8 rounded-4xl space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-2.5">
              <span>Candidate Cohort Tracking & Viva Governance</span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/[0.06] text-slate-300 font-mono font-bold">
                {filteredStudents.length} Students
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Shows which eligible students have booked vs. unbooked, with automated AI nudges and AST forensics.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or roll..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <select
              value={filterState}
              onChange={e => setFilterState(e.target.value)}
              className="bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none font-medium"
            >
              <option value="ALL">All States</option>
              <option value="ELIGIBLE_UNBOOKED">Eligible — NOT Booked</option>
              <option value="BOOKED">Eligible — Booked</option>
              <option value="AWARDED">Badge Awarded</option>
              <option value="RETAKE">Retake Cooldown</option>
              <option value="NULLIFIED">Badge Nullified (Malpractice)</option>
            </select>
          </div>
        </div>

        {/* Candidate Table */}
        <div className="overflow-x-auto border border-white/[0.08] rounded-3xl bg-black/40">
          <table className="w-full text-xs text-left">
            <thead className="bg-white/[0.02] text-slate-400 border-b border-white/[0.08] uppercase tracking-wider text-[11px] font-mono">
              <tr>
                <th className="p-4">Candidate</th>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Skills Benchmark</th>
                <th className="p-4">Booking / Viva Status</th>
                <th className="p-4">Assigned Slot / Credential</th>
                <th className="p-4 text-right">Ops Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredStudents.map(student => {
                const isEligibleUnbooked = student.status === 'ELIGIBLE_PENDING_BOOKING';
                const isBooked = student.status === 'SLOT_BOOKED';
                const isAwarded = student.status === 'BADGE_AWARDED';
                const isNullified = student.status === 'BADGE_NULLIFIED_MALPRACTICE';
                const isRetake = student.status === 'VIVA_FAILED_RETAKE';
                const wasNudged = nudgeSuccessMap[student.enrollment_id];

                return (
                  <tr key={student.student_id} className="hover:bg-white/[0.02] transition">
                    {/* Candidate */}
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={student.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                          alt={student.name}
                          className="w-10 h-10 rounded-2xl object-cover border border-white/20 shadow"
                        />
                        <div>
                          <div className="font-extrabold text-white text-sm">{student.name}</div>
                          <div className="text-xs text-slate-500">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Roll */}
                    <td className="p-4 font-mono font-bold text-slate-300">
                      {student.roll_number || '—'}
                    </td>

                    {/* Skills */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${student.cleared_skills_count === 5 ? 'text-emerald-400' : 'text-slate-400'}`}>
                          {student.cleared_skills_count}/5
                        </span>
                        <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${(student.cleared_skills_count / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Booking Status Badge */}
                    <td className="p-4">
                      {isEligibleUnbooked && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
                          <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                          Eligible (NOT Booked)
                        </span>
                      )}

                      {isBooked && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 w-fit">
                          <Clock className="w-3.5 h-3.5" />
                          Slot Booked
                        </span>
                      )}

                      {isAwarded && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Badge Awarded
                        </span>
                      )}

                      {isRetake && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 flex items-center gap-1.5 w-fit">
                          Retake Cooldown
                        </span>
                      )}

                      {isNullified && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5 w-fit">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Badge Nullified
                        </span>
                      )}

                      {student.status === 'SKILLS_IN_PROGRESS' && (
                        <span className="px-2.5 py-1 rounded-full text-xs text-slate-500 bg-white/[0.04] border border-white/[0.08]">
                          Skills In Progress
                        </span>
                      )}
                    </td>

                    {/* Slot / Credential Details */}
                    <td className="p-4">
                      {isBooked && (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-200">{student.slot_date} at {student.start_time}</div>
                          <div className="text-xs text-slate-500">Panelist: {student.interviewer_name}</div>
                        </div>
                      )}

                      {isAwarded && (
                        <div className="space-y-0.5">
                          <div className="font-mono text-emerald-400 font-extrabold">{student.badge_credential_id}</div>
                          <div className="text-[11px] text-slate-500">Minted: {student.badge_awarded_at?.substring(0, 10)}</div>
                        </div>
                      )}

                      {isEligibleUnbooked && (
                        <div className="text-slate-500">
                          {student.last_nudged_at ? (
                            <span className="text-xs text-cyan-400 font-medium">Nudged on {student.last_nudged_at.substring(0, 10)}</span>
                          ) : (
                            <span className="text-xs text-amber-400/90 font-bold">Pending initial booking</span>
                          )}
                        </div>
                      )}

                      {isNullified && (
                        <div className="text-rose-400 font-mono text-xs font-bold">
                          VOIDED: {student.badge_credential_id}
                        </div>
                      )}
                    </td>

                    {/* Ops Action Button */}
                    <td className="p-4 text-right">
                      {isEligibleUnbooked && (
                        <button
                          onClick={() => handleNudge(student.enrollment_id, student.name)}
                          disabled={wasNudged}
                          className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:bg-emerald-600 text-slate-950 disabled:text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 ml-auto transition shadow-lg shadow-amber-500/20"
                        >
                          {wasNudged ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Nudge Sent!</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>AI Booking Nudge</span>
                            </>
                          )}
                        </button>
                      )}

                      {isAwarded && (
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setSelectedCandidateForForensics(student)}
                            className="p-2 text-slate-400 hover:text-indigo-400 rounded-xl hover:bg-white/[0.06] transition"
                            title="Inspect AI Plagiarism Radar"
                          >
                            <Fingerprint className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedCandidateForMalpractice(student)}
                            className="px-3.5 py-2 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition"
                            title="Trigger academic audit & revoke credential"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Flag Malpractice</span>
                          </button>
                        </div>
                      )}

                      {isNullified && (
                        <button
                          onClick={() => setSelectedCandidateForForensics(student)}
                          className="px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] text-rose-300 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 ml-auto border border-white/[0.08]"
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span>View AST Match</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Malpractice Audit Logs Section */}
      {auditLogs.length > 0 && (
        <div className="luxe-panel p-8 rounded-4xl space-y-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-400 font-display font-extrabold text-base">
              <ShieldAlert className="w-5 h-5" />
              <span>Academic Integrity Revocation Audit Registry</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Enforced by NIAT Automated AST Code Forensics
            </span>
          </div>
          <div className="space-y-3.5">
            {auditLogs.map(log => (
              <div key={log.id} className="p-5 bg-black/40 border border-rose-500/30 rounded-3xl space-y-2 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-white text-sm">{log.student_name}</span>
                    <span className="font-mono text-slate-400 font-bold">({log.student_roll})</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-500/15 text-rose-300 font-black border border-rose-500/30">
                      {log.violation_type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Flagged: {log.flagged_at} by {log.admin_name}
                  </div>
                </div>
                <p className="text-slate-300 font-mono text-xs leading-relaxed bg-black/50 p-3.5 rounded-2xl border border-white/[0.06]">
                  {log.evidence_summary}
                </p>
                <div className="text-xs text-rose-400 font-mono font-bold">
                  Voided Credential ID: {log.revoked_credential_id}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Malpractice Audit Action Modal */}
      {selectedCandidateForMalpractice && (
        <MalpracticeAuditModal
          isOpen={true}
          onClose={() => setSelectedCandidateForMalpractice(null)}
          candidate={selectedCandidateForMalpractice}
          adminId={adminId}
          onSuccess={loadData}
        />
      )}

      {/* AI Forensic Inspector Modal */}
      {selectedCandidateForForensics && (
        <AIForensicInspectorModal
          isOpen={true}
          onClose={() => setSelectedCandidateForForensics(null)}
          candidate={selectedCandidateForForensics}
          onConfirmNullification={() => {
            const cand = selectedCandidateForForensics;
            setSelectedCandidateForForensics(null);
            setSelectedCandidateForMalpractice(cand);
          }}
        />
      )}
    </div>
  );
};
