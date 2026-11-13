import React from 'react';
import { FileText, Database, GitBranch, Shield, CheckCircle } from 'lucide-react';

interface ArchitectureDocsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDocsDrawer: React.FC<ArchitectureDocsDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl my-auto max-h-[88vh] bg-[#0a0d16] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">GRIT Track Badge Viva System — Engineering RFC (2-Page Write-up)</h2>
              <p className="text-xs text-slate-400">Architectural Specifications, State Machine, Relational Schema & Failure Modes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-8 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-2">
              <GitBranch className="w-4 h-4 text-amber-400" />
              <span>1. Student Interview Journey & Deterministic State Machine</span>
            </div>
            <p>
              A candidate's interview journey is governed by strict state transitions. No candidate can transition into an interview without satisfying prerequisite skill contest benchmarks.
            </p>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#131B2E] text-slate-200 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Current State</th>
                    <th className="p-3">Trigger / Event</th>
                    <th className="p-3">Guard / Conditions</th>
                    <th className="p-3">Next State</th>
                    <th className="p-3">System Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="p-3 text-slate-400">SKILLS_IN_PROGRESS</td>
                    <td className="p-3 text-cyan-400">CONTEST_SCORE_RECORDED</td>
                    <td className="p-3">cleared_skills &lt; total_required</td>
                    <td className="p-3 text-slate-400">SKILLS_IN_PROGRESS</td>
                    <td className="p-3 text-slate-400">Update progress %; lock booking UI.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-400">SKILLS_IN_PROGRESS</td>
                    <td className="p-3 text-cyan-400">BENCHMARK_FINAL_CLEARED</td>
                    <td className="p-3">cleared_skills == total_required (5/5)</td>
                    <td className="p-3 text-amber-400 font-semibold">ELIGIBLE_PENDING_BOOKING</td>
                    <td className="p-3 text-slate-300">Set is_eligible=1; unlock booking calendar; trigger nudge queue.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-amber-400">ELIGIBLE_PENDING_BOOKING</td>
                    <td className="p-3 text-cyan-400">SLOT_RESERVED</td>
                    <td className="p-3">slot.status == 'AVAILABLE'</td>
                    <td className="p-3 text-blue-400 font-semibold">SLOT_BOOKED</td>
                    <td className="p-3 text-slate-300">Atomic SQL lock on slot; create interview_booking; emit Student Message #1.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-blue-400">SLOT_BOOKED</td>
                    <td className="p-3 text-cyan-400">STUDENT_CANCELLED</td>
                    <td className="p-3">now &lt; (slot_time - 6 hours)</td>
                    <td className="p-3 text-amber-400">ELIGIBLE_PENDING_BOOKING</td>
                    <td className="p-3 text-slate-300">Release slot back to 'AVAILABLE'; cancel booking.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-blue-400">SLOT_BOOKED</td>
                    <td className="p-3 text-cyan-400">VIVA_EVALUATED (PASS)</td>
                    <td className="p-3">rubric_score &gt;= 3.5 & interviewer_approval</td>
                    <td className="p-3 text-emerald-400 font-bold">BADGE_AWARDED</td>
                    <td className="p-3 text-slate-300">Mint unique credential ID; emit Student Message #2 (Pass); publish to profile.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-blue-400">SLOT_BOOKED</td>
                    <td className="p-3 text-cyan-400">VIVA_EVALUATED (RETAKE)</td>
                    <td className="p-3">rubric_score &lt; 3.5 & potential demonstrated</td>
                    <td className="p-3 text-yellow-500 font-semibold">VIVA_FAILED_RETAKE</td>
                    <td className="p-3 text-slate-300">Set retake_cooling_until = now + 10 days; emit rubric feedback; lock booking until cooldown expiry.</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-emerald-400">BADGE_AWARDED</td>
                    <td className="p-3 text-rose-400 font-bold">MALPRACTICE_AUDIT_FLAG</td>
                    <td className="p-3">AST similarity &gt; 85% or Proctoring breach</td>
                    <td className="p-3 text-rose-500 font-bold">BADGE_NULLIFIED_MALPRACTICE</td>
                    <td className="p-3 text-rose-300">Revoke credential; write to malpractice_audit_logs; emit Student Message #3; suspend track privileges.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>2. Edge Cases, Failure Modes & Engineering Assumptions</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#131B2E] border border-slate-800 rounded-lg space-y-1.5">
                <h4 className="font-semibold text-white text-xs">1. Post-Award Malpractice Flagging</h4>
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">Problem:</strong> A student clears viva, earns their badge, but later automated AST code plagiarism or proctoring audits catch malpractice in Contest #4.
                </p>
                <p className="text-xs text-emerald-400">
                  <strong className="text-slate-300">Resolution:</strong> An atomic revocation transaction revokes the credential, changes student dashboard to Nullified, logs the admin audit trail, and disables viva re-booking.
                </p>
              </div>

              <div className="p-4 bg-[#131B2E] border border-slate-800 rounded-lg space-y-1.5">
                <h4 className="font-semibold text-white text-xs">2. Slot Concurrency & Race Conditions</h4>
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">Problem:</strong> Two eligible students attempt to book the exact same 10:00 AM slot at the exact same millisecond.
                </p>
                <p className="text-xs text-emerald-400">
                  <strong className="text-slate-300">Resolution:</strong> Database-level <code className="text-cyan-400">UNIQUE(slot_id)</code> constraint on <code className="text-cyan-400">interview_bookings</code> and atomic <code className="text-cyan-400">BEGIN TRANSACTION</code>. The second query immediately receives a clean 400 error.
                </p>
              </div>

              <div className="p-4 bg-[#131B2E] border border-slate-800 rounded-lg space-y-1.5">
                <h4 className="font-semibold text-white text-xs">3. Retake Cooling-Off Window</h4>
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">Problem:</strong> Students failing a viva immediately re-book the next day without working on gaps, wasting interviewer capacity.
                </p>
                <p className="text-xs text-emerald-400">
                  <strong className="text-slate-300">Resolution:</strong> Enforced 10-day cooldown timestamp (<code className="text-cyan-400">retake_cooling_until</code>). Booking button remains locked with a live countdown and rubric preparation suggestions.
                </p>
              </div>

              <div className="p-4 bg-[#131B2E] border border-slate-800 rounded-lg space-y-1.5">
                <h4 className="font-semibold text-white text-xs">4. Candidate No-Shows & Cancellation Window</h4>
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">Problem:</strong> Late cancellations leave interviewer slots empty.
                </p>
                <p className="text-xs text-emerald-400">
                  <strong className="text-slate-300">Resolution:</strong> Free cancellation permitted up to 6 hours before. Unexcused no-shows trigger a 7-day booking lock.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base border-b border-slate-800 pb-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>3. Relational Schema & Key Data Models</span>
            </div>
            <p>
              Our database design uses a relational SQL model (<code className="text-cyan-400">SQLite / PostgreSQL</code>) with strict constraints ensuring referential integrity and zero phantom bookings.
            </p>
            <div className="p-4 bg-[#080C14] border border-slate-800 rounded-lg font-mono text-xs text-slate-300 space-y-2">
              <p className="text-cyan-400">// Core Tables</p>
              <p>• <strong>users:</strong> (id, name, email, role, roll_number, headline, avatar_url)</p>
              <p>• <strong>tracks:</strong> (id, code, name, badge_title, total_skills_required)</p>
              <p>• <strong>track_skills:</strong> (id, track_id, skill_code, contest_name, cut_off_score)</p>
              <p>• <strong>student_track_enrollments:</strong> (id, student_id, track_id, is_eligible, status, badge_credential_id, badge_awarded_at, badge_nullified_at, retake_cooling_until)</p>
              <p>• <strong>interviewer_slots:</strong> (id, interviewer_id, slot_date, start_time, end_time, status, meeting_link)</p>
              <p>• <strong>interview_bookings:</strong> (id, slot_id UNIQUE, enrollment_id, student_id, interviewer_id, status)</p>
              <p>• <strong>interview_evaluations:</strong> (id, booking_id UNIQUE, outcome, score_system_design, score_problem_solving, score_code_quality, rubric_feedback)</p>
              <p>• <strong>malpractice_audit_logs:</strong> (id, enrollment_id, student_id, flagged_by_admin_id, violation_type, evidence_summary, revoked_credential_id)</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-sm transition"
          >
            Close RFC View
          </button>
        </div>
      </div>
    </div>
  );
};

