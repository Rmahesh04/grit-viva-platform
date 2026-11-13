import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, ShieldAlert, Copy, Check } from 'lucide-react';

interface StudentMessagesShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentMessagesShowcase: React.FC<StudentMessagesShowcaseProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  if (!isOpen) return null;

  const messages = [
    {
      id: 1,
      title: "1. Interview Slot Booking Confirmation",
      trigger: "Triggered immediately when an eligible student books a viva slot.",
      channel: "Dashboard Modal & Push Notification / Registered Email",
      type: "success",
      icon: CheckCircle2,
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      content: `🎯 Your GRIT Track Badge Viva is Confirmed!

Hi Rahul,

Congratulations on clearing all 5 prerequisite skill contests for the Full Stack Web Engineering Track! Your final viva interview has been scheduled with Priya Sharma (Staff Engineer @ NIAT).

📅 Date: Friday, November 13, 2026
⏰ Time: 10:00 AM – 10:45 AM IST (45 mins)
📍 Interview Link: https://meet.niatindia.com/viva-priya-101
📋 Evaluator Focus: System Design, Frontend Architecture, RDBMS Concurrency & Live Code Defense.

Important Guidelines:
1. Join via a laptop with webcam and microphone enabled in a quiet room.
2. Have your Contest #4 submission repository open for architectural defense.
3. Rescheduling is permitted up to 6 hours before the slot.

Best of luck! Let's earn that Track Badge.`
    },
    {
      id: 2,
      title: "2. Interview Result & Rubric Evaluation (Pass / Retake)",
      trigger: "Triggered the moment the interviewer submits the viva evaluation rubric.",
      channel: "Student Home Screen Banner & Performance Dossier",
      type: "info",
      icon: Mail,
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      content: `🏆 Viva Result: Track Badge Awarded! (or Retake Recommended)

--- [VARIANT A: PASS OUTCOME] ---
🎉 Congratulations Karthik! You have officially cleared the Track Badge Viva!

Your interviewer Priya Sharma has accredited your technical defense with an overall rubric rating of 4.7 / 5.0.
• System Design: 5/5
• Problem Solving: 5/5
• Code Quality: 4/5

Interviewer Feedback:
"Exemplary viva performance. Karthik demonstrated deep intuition on distributed cache invalidation strategies and concurrency isolation in PostgreSQL. Code organization in React was modular and clean."

Your digital credential has been minted:
Credential ID: GRIT-2026-FS-84920
View & verify your badge on your NIAT Profile or export to LinkedIn.

--- [VARIANT B: RETAKE LATER OUTCOME] ---
📘 Viva Evaluation: Retake Recommended

Hi Sneha,
Thank you for appearing for the Full Stack Track Viva. The evaluation panel recommended additional preparation before issuing your badge.

Interviewer Feedback:
"Good baseline problem-solving, but struggled to explain database connection pooling and resolving state race conditions. Review database isolation levels and asynchronous locks."

Next Steps:
A 10-day preparation cooldown is active until Nov 20, 2026. Review the recommended NIAT System Design modules. Your booking portal will automatically unlock on Nov 21, 2026.`
    },
    {
      id: 3,
      title: "3. Academic Integrity Violation & Badge Nullification Alert",
      trigger: "Triggered if post-award proctoring code similarity audit flags malpractice.",
      channel: "High-Priority Red Dashboard Alert & Academic Disciplinary Email",
      type: "danger",
      icon: ShieldAlert,
      badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      content: `⚠️ URGENT: Academic Integrity Violation & Track Badge Revocation

Dear Vikram Malhotra (Roll No: NIAT23CS0330),

This is an official communication from the NIAT GRIT Academic Integrity Committee.

Following a routine post-evaluation audit of your Contest #4 (Database Concurrency) submission, the automated AST similarity pipeline flagged an unauthorized similarity index of 94.2% against an uncredited external codebase. A manual forensic review by our engineering audit board confirmed the violation.

As per the GRIT Code of Honor:
1. Track Badge (Credential ID: GRIT-2026-FS-77104) has been permanently nullified.
2. Your student dashboard status has been updated to BADGE NULLIFIED (MALPRACTICE).
3. All pending interview privileges for this track are indefinitely suspended.

Right to Appeal:
If you believe this determination was made in error, you may file a formal petition with complete git commit logs and proof of authorship within 5 working days by replying to integrity-committee@niatindia.com.

NIAT Academic Integrity Board`
    }
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl my-auto max-h-[88vh] bg-[#0a0d16] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">The 3 Most Important Student Messages</h2>
              <p className="text-xs text-slate-400">Written exactly as they appear in the student flow (as required in assignment)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {messages.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={m.id} className="border border-slate-800 rounded-xl bg-[#131B2E] overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${m.badgeColor}`}>
                      {m.title}
                    </span>
                    <span className="text-xs text-slate-400">{m.channel}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(m.content, idx)}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Exact Text</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 bg-[#0B0F19]/50 border-b border-slate-800/50">
                  <p className="text-xs text-slate-400"><strong className="text-slate-300">Trigger Event:</strong> {m.trigger}</p>
                </div>
                <div className="p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#080C14]">
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

