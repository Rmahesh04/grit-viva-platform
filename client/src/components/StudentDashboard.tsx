import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  BookOpen,
  Sparkles,
  Lock,
  XCircle,
  Share2,
  BrainCircuit,
  Fingerprint,
  ArrowRight,
  Zap
} from 'lucide-react';
import { StudentProfileData, api } from '../api/client';
import { SlotBookingModal } from './SlotBookingModal';
import { AIVivaCoachModal } from './AIVivaCoachModal';
import { AIForensicInspectorModal } from './AIForensicInspectorModal';

interface StudentDashboardProps {
  data: StudentProfileData;
  onRefresh: () => void;
  onSelectPersona: (studentId: string) => void;
}

const PERSONAS = [
  { id: 'std_rohit',   label: 'Skills In Progress',  sub: 'Rohit — 3/5',     tag: 'STATE 1',       accent: '#71717a', tagBg: 'rgba(113,113,122,0.1)',  tagBorder: 'rgba(113,113,122,0.2)' },
  { id: 'std_rahul',   label: 'Eligible — Book Slot', sub: 'Rahul — 5/5',    tag: 'BEFORE VIVA',   accent: '#f59e0b', tagBg: 'rgba(245,158,11,0.1)',   tagBorder: 'rgba(245,158,11,0.3)'  },
  { id: 'std_ananya',  label: 'Viva Scheduled',       sub: 'Ananya — Booked', tag: 'SLOT RESERVED', accent: '#6366f1', tagBg: 'rgba(99,102,241,0.1)',   tagBorder: 'rgba(99,102,241,0.3)'  },
  { id: 'std_karthik', label: 'Badge Awarded 🎉',     sub: 'Karthik — Pass',  tag: 'AFTER: PASS',   accent: '#10b981', tagBg: 'rgba(16,185,129,0.1)',   tagBorder: 'rgba(16,185,129,0.3)'  },
  { id: 'std_sneha',   label: 'Cooldown Active',      sub: 'Sneha — Retake',  tag: 'AFTER: RETAKE', accent: '#eab308', tagBg: 'rgba(234,179,8,0.1)',    tagBorder: 'rgba(234,179,8,0.3)'   },
  { id: 'std_vikram',  label: 'Badge Revoked ⚠️',     sub: 'Vikram — Flag',   tag: 'MALPRACTICE',   accent: '#f43f5e', tagBg: 'rgba(244,63,94,0.1)',    tagBorder: 'rgba(244,63,94,0.3)'   },
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ data, onRefresh, onSelectPersona }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);
  const [showAIForensic, setShowAIForensic] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { student, enrollment, skills, activeBooking, evaluations } = data;
  const status = enrollment?.status || 'SKILLS_IN_PROGRESS';
  const clearedCount = enrollment?.cleared_skills_count ?? skills.filter(s => s.is_cleared).length;
  const totalSkills = enrollment?.total_skills_required ?? skills.length;

  const handleCancelBooking = async () => {
    if (!activeBooking) return;
    if (!confirm('Cancel your viva slot? This releases it back to the pool.')) return;
    try {
      setCancelling(true);
      await api.cancelSlot({ bookingId: activeBooking.booking_id, studentId: student.id, reason: 'Student rescheduled from dashboard' });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel slot');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ══════════════════════════════════════════════════════════════
          BEFORE & AFTER STATE SIMULATOR
      ══════════════════════════════════════════════════════════════ */}
      <div className="luxe-panel rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.01em' }}>
              Before &amp; After Screen State Simulator
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">Click a persona to witness the student dashboard transform across each journey state</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {PERSONAS.map(p => {
            const isActive = student.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p.id)}
                className="text-left p-3.5 rounded-xl transition-all duration-200 group"
                style={{
                  background: isActive ? p.tagBg : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isActive ? p.tagBorder : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: isActive ? `0 0 20px -6px ${p.accent}40` : 'none',
                }}
              >
                <div className="text-[9px] font-mono font-black uppercase tracking-wider mb-1.5"
                  style={{ color: isActive ? p.accent : '#52525b' }}>
                  {p.tag}
                </div>
                <div className="text-xs font-bold leading-tight"
                  style={{ color: isActive ? '#f8fafc' : '#71717a' }}>
                  {p.label}
                </div>
                <div className="text-[10px] mt-1"
                  style={{ color: isActive ? p.accent : '#3f3f46', opacity: isActive ? 0.8 : 1 }}>
                  {p.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CANDIDATE PROFILE HERO
      ══════════════════════════════════════════════════════════════ */}
      <div className="luxe-panel rounded-2xl p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={student.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
              alt={student.name}
              className="w-[72px] h-[72px] rounded-2xl object-cover"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6366f1&color=fff&size=150&bold=true`;
              }}
            />
            <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-black" />
          </div>

          {/* Identity */}
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.03em' }}>
                {student.name}
              </h1>
              <span className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
                {student.roll_number || 'NIAT-CANDIDATE'}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mb-2">{student.headline}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Track:</span>
              <span className="text-zinc-200 font-semibold">{enrollment?.track_name || 'Full Stack Web Engineering'}</span>
              <span className="text-zinc-700">•</span>
              <span className="font-bold" style={{ color: clearedCount >= totalSkills ? '#10b981' : '#f59e0b' }}>
                {clearedCount}/{totalSkills} Skills Cleared
              </span>
            </div>
          </div>
        </div>

        {/* Right: Status + Actions */}
        <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
          <StatusChip status={status} enrollment={enrollment} />

          <button
            onClick={() => setShowAICoach(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:brightness-110"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 20px -4px rgba(99,102,241,0.4)' }}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Pre-Viva Coach &amp; Auditor</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STATE-SPECIFIC BANNERS
      ══════════════════════════════════════════════════════════════ */}

      {/* ELIGIBLE → BOOK SLOT (BEFORE state) */}
      {status === 'ELIGIBLE_PENDING_BOOKING' && (
        <div className="rounded-2xl p-7 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 animate-fade-in"
          style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.08) 0%,rgba(99,102,241,0.06) 100%)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Sparkles className="w-3 h-3" />
                All {totalSkills} Skills Cleared — Final Step!
              </span>
            </div>
            <h3 className="text-xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Schedule Your 45-Minute Live Technical Viva
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              You have cleared all contest benchmarks for the {enrollment?.track_name}. Choose a panel slot to present your code architecture and earn your accredited Track Badge.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowAICoach(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              AI Prep Diagnostic
            </button>
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', boxShadow: '0 4px 20px -4px rgba(245,158,11,0.4)' }}
            >
              <Calendar className="w-4 h-4" />
              Book Interview Slot
            </button>
          </div>
        </div>
      )}

      {/* SLOT BOOKED → COUNTDOWN */}
      {status === 'SLOT_BOOKED' && activeBooking && (
        <div className="luxe-panel rounded-2xl p-7 space-y-6 animate-fade-in"
          style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4 pb-5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Confirmed Viva Appointment
                </h3>
                <p className="text-xs text-zinc-500">45-Minute Technical Defense via Google Meet</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleCancelBooking} disabled={cancelling}
                className="text-xs text-zinc-500 hover:text-rose-400 transition font-medium px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                {cancelling ? 'Releasing...' : 'Cancel / Reschedule'}
              </button>
              <a href={activeBooking.meeting_link} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white transition hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 16px -4px rgba(99,102,241,0.4)' }}>
                <Video className="w-4 h-4" />
                Join Live Room
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoBlock icon={<Clock className="w-4 h-4 text-amber-400" />} label="Appointment Window">
              <div className="text-base font-bold text-white mt-1">{activeBooking.slot_date}</div>
              <div className="text-sm font-mono font-bold text-amber-400">{activeBooking.start_time} – {activeBooking.end_time} IST</div>
            </InfoBlock>
            <InfoBlock icon={<div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-black text-white overflow-hidden">
              <img src={activeBooking.interviewer_avatar} className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
            </div>} label="Assigned Panelist">
              <div className="text-base font-bold text-white mt-1">{activeBooking.interviewer_name}</div>
              <div className="text-xs text-zinc-500 truncate">{activeBooking.interviewer_headline}</div>
            </InfoBlock>
            <InfoBlock icon={<BookOpen className="w-4 h-4 text-cyan-400" />} label="Defense Checklist">
              <div className="space-y-1 mt-1 text-xs text-zinc-400">
                <p>✓ Working webcam &amp; mic</p>
                <p>✓ Contest repository open</p>
                <p>✓ Quiet environment, no AI aid</p>
              </div>
            </InfoBlock>
          </div>
        </div>
      )}

      {/* RETAKE COOLDOWN */}
      {status === 'VIVA_FAILED_RETAKE' && (
        <div className="rounded-2xl p-7 space-y-4 animate-fade-in"
          style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <RotateCcw className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Viva Result: Retake Recommended
                </h3>
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24', border: '1px solid rgba(234,179,8,0.25)' }}>
                  STUDENT MESSAGE #2
                </span>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your technical viva was completed. While your foundational logic was strong, the evaluation panel identified gaps in high-throughput connection pooling and async race conditions.
              </p>
              <div className="p-4 rounded-xl text-xs font-mono space-y-1.5"
                style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(234,179,8,0.15)', color: '#fde68a' }}>
                <p>⏳ <strong>Cooldown Window Active Until:</strong> November 20, 2026</p>
                <p>📚 <strong>Action Required:</strong> Complete NIAT System Design Sprint #3 before booking unlocks (Nov 21).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MALPRACTICE FLAGGED */}
      {status === 'BADGE_NULLIFIED_MALPRACTICE' && (
        <div className="rounded-2xl p-7 space-y-5 animate-fade-in"
          style={{ background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.3)' }}>
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)' }}>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-black text-rose-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  URGENT: Academic Integrity Violation &amp; Badge Revocation
                </h3>
                <button
                  onClick={() => setShowAIForensic(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: 'rgba(244,63,94,0.15)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.3)' }}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  Inspect AI Plagiarism &amp; AST Radar
                </button>
              </div>
              <div className="p-5 rounded-xl text-xs font-mono space-y-3 leading-relaxed"
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(244,63,94,0.15)', color: '#fecdd3' }}>
                <p>Dear <strong className="text-white">{student.name}</strong> ({student.roll_number}),</p>
                <p>
                  Following a routine post-evaluation audit of your Contest #4 (Database Concurrency) submission, the automated AST similarity pipeline flagged an unauthorized similarity index of <strong className="text-rose-300">94.2%</strong> against an uncredited external codebase. A forensic inspection by the NIAT Academic Integrity Board confirmed the violation.
                </p>
                <div className="p-3 rounded-lg" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                  <strong className="text-rose-300">Board Findings:</strong>{' '}
                  <span className="text-zinc-300">{enrollment?.nullification_reason || 'AST structural similarity exceeded 90% threshold against external repository without attribution.'}</span>
                </div>
                <p className="text-zinc-500">
                  <strong className="text-zinc-400">Action:</strong> Your Track Badge is permanently voided. To appeal, file a formal petition with commit evidence within 5 working days to integrity-committee@niatindia.com.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SKILLS IN PROGRESS */}
      {status === 'SKILLS_IN_PROGRESS' && (
        <div className="rounded-2xl p-6 animate-fade-in"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-4 mb-4">
            <Lock className="w-5 h-5 text-zinc-600" />
            <div>
              <h3 className="text-sm font-bold text-zinc-300">Viva Interview Locked — Complete Skill Prerequisites</h3>
              <p className="text-xs text-zinc-600 mt-0.5">Clear all {totalSkills} contest benchmarks to unlock your interview booking slot.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(clearedCount / totalSkills) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
            </div>
            <span className="text-xs font-mono font-bold text-zinc-400">{clearedCount}/{totalSkills}</span>
          </div>
        </div>
      )}

      {/* BADGE AWARDED */}
      {status === 'BADGE_AWARDED' && (
        <div className="rounded-2xl p-6 animate-fade-in"
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-emerald-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                🎉 Track Badge Earned — {enrollment?.badge_title}
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Your accredited credential has been minted and verified on the NIAT registry.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TRACK BADGE + SKILLS GRID
      ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Track Badge Card */}
        <div className="luxe-panel rounded-2xl p-7 flex flex-col justify-between gap-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 font-mono">Official Credential</span>
            {status === 'BADGE_AWARDED' && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}>
                VERIFIED
              </span>
            )}
          </div>

          <div className={`p-7 rounded-2xl border flex flex-col items-center text-center space-y-4 relative ${
            status === 'BADGE_AWARDED' ? 'hologram-effect glow-gold' : ''
          }`}
            style={{
              borderColor: status === 'BADGE_AWARDED' ? 'rgba(245,158,11,0.4)'
                : status === 'BADGE_NULLIFIED_MALPRACTICE' ? 'rgba(244,63,94,0.3)'
                : 'rgba(255,255,255,0.06)',
              background: status === 'BADGE_AWARDED' ? undefined
                : status === 'BADGE_NULLIFIED_MALPRACTICE' ? 'rgba(244,63,94,0.06)'
                : 'rgba(255,255,255,0.02)',
              opacity: status === 'BADGE_AWARDED' ? 1 : status === 'BADGE_NULLIFIED_MALPRACTICE' ? 0.8 : 0.5,
            }}>

            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2`}
              style={{
                background: status === 'BADGE_AWARDED' ? 'linear-gradient(135deg,#f59e0b,#fbbf24)'
                  : status === 'BADGE_NULLIFIED_MALPRACTICE' ? 'rgba(244,63,94,0.15)'
                  : 'rgba(255,255,255,0.04)',
                borderColor: status === 'BADGE_AWARDED' ? '#fde68a'
                  : status === 'BADGE_NULLIFIED_MALPRACTICE' ? '#f43f5e'
                  : 'rgba(255,255,255,0.1)',
                boxShadow: status === 'BADGE_AWARDED' ? '0 0 40px -8px rgba(245,158,11,0.6)' : 'none',
              }}>
              <Award className={`w-10 h-10 ${
                status === 'BADGE_AWARDED' ? 'text-black'
                : status === 'BADGE_NULLIFIED_MALPRACTICE' ? 'text-rose-500'
                : 'text-zinc-700'
              }`} />
            </div>

            <div>
              <h4 className="font-black text-white text-base" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {enrollment?.badge_title || 'Full Stack Web Engineer'}
              </h4>
              <p className="text-xs text-zinc-500 mt-1">{enrollment?.track_name || 'Track Badge'}</p>
            </div>

            {status === 'BADGE_AWARDED' && enrollment?.badge_credential_id && (
              <div className="w-full pt-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Public Registry Hash</div>
                <div className="font-mono text-xs font-black text-amber-300">{enrollment.badge_credential_id}</div>
                <div className="text-[10px] text-zinc-600">Minted {enrollment.badge_awarded_at?.substring(0, 10)}</div>
              </div>
            )}

            {status === 'BADGE_NULLIFIED_MALPRACTICE' && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(3px)' }}>
                <span className="px-4 py-1.5 font-black text-xs tracking-widest uppercase transform -rotate-12"
                  style={{ background: '#dc2626', color: '#fff', border: '2px solid rgba(255,255,255,0.3)' }}>
                  REVOKED / VOID
                </span>
              </div>
            )}
          </div>

          {status === 'BADGE_AWARDED' && (
            <button
              onClick={() => alert(`Credential ${enrollment?.badge_credential_id} verified against NIAT public key registry.`)}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#000', boxShadow: '0 4px 16px -4px rgba(245,158,11,0.4)' }}>
              <Share2 className="w-3.5 h-3.5" />
              Share Credential on LinkedIn
            </button>
          )}
        </div>

        {/* Skills Clearance Breakdown */}
        <div className="luxe-panel rounded-2xl p-7 lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Prerequisite Skill Contests
              </h3>
              <p className="text-xs text-zinc-600 mt-0.5">All benchmarks must be cleared before viva defense unlocks</p>
            </div>
            <span className="text-xs font-black font-mono px-3 py-1 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
              {skills.filter(s => s.is_cleared).length} / {skills.length} Cleared
            </span>
          </div>

          <div className="space-y-2.5">
            {skills.map(skill => (
              <div key={skill.id}
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}
                    style={{
                      background: skill.is_cleared ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${skill.is_cleared ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {skill.is_cleared
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : <Lock className="w-4 h-4 text-zinc-700" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{skill.skill_name}</div>
                    <div className="text-xs text-zinc-600">{skill.contest_name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <div className="text-[11px] text-zinc-600">Cut-off: {skill.cut_off_score}%</div>
                    {skill.is_cleared
                      ? <div className="text-sm font-black text-emerald-400">{skill.score_achieved}%</div>
                      : <div className="text-xs text-zinc-600">Pending</div>
                    }
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md hidden sm:inline"
                    style={{
                      background: skill.difficulty === 'BENCHMARK' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)',
                      color: skill.difficulty === 'BENCHMARK' ? '#fbbf24' : '#71717a',
                      border: `1px solid ${skill.difficulty === 'BENCHMARK' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    {skill.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          EVALUATION HISTORY
      ══════════════════════════════════════════════════════════════ */}
      {evaluations && evaluations.length > 0 && (
        <div className="luxe-panel rounded-2xl p-7 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Official Viva Evaluation History &amp; Rubric Scores
              </h3>
            </div>
            <span className="text-xs text-zinc-600 font-mono">NIAT Technical Board</span>
          </div>

          <div className="space-y-4">
            {evaluations.map((ev: any) => (
              <div key={ev.id} className="p-6 rounded-xl space-y-4"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-sm font-bold text-white">{ev.interviewer_name}</span>
                    <span className="text-zinc-600 mx-2">•</span>
                    <span className="text-xs text-zinc-500">{ev.slot_date} at {ev.start_time}</span>
                  </div>
                  <span className="text-xs font-black px-3 py-1 rounded-lg"
                    style={{
                      background: ev.outcome === 'PASS' ? 'rgba(16,185,129,0.12)' : 'rgba(234,179,8,0.1)',
                      color: ev.outcome === 'PASS' ? '#34d399' : '#fbbf24',
                      border: `1px solid ${ev.outcome === 'PASS' ? 'rgba(16,185,129,0.25)' : 'rgba(234,179,8,0.2)'}`,
                    }}>
                    {ev.outcome === 'PASS' ? '✓ ACCREDITED (PASS)' : '↺ RETAKE RECOMMENDED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'System Design & Scalability', score: ev.score_system_design },
                    { label: 'Problem Solving & Algorithms', score: ev.score_problem_solving },
                    { label: 'Code Architecture Defense', score: ev.score_code_quality },
                  ].map(({ label, score }) => (
                    <div key={label} className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div className="text-xs text-zinc-500">{label}</div>
                      <div className="text-xl font-black mt-1" style={{ color: score >= 4 ? '#34d399' : score >= 3 ? '#fbbf24' : '#f87171' }}>
                        {score}<span className="text-sm text-zinc-600 font-normal"> / 5.0</span>
                      </div>
                    </div>
                  ))}
                </div>

                {ev.rubric_feedback && (
                  <div className="p-4 rounded-xl text-xs font-mono text-zinc-300 leading-relaxed italic"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    &ldquo;{ev.rubric_feedback}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showBookingModal && (
        <SlotBookingModal
          isOpen={true}
          onClose={() => setShowBookingModal(false)}
          enrollmentId={enrollment?.id || ''}
          studentId={student.id}
          studentName={student.name}
          trackName={enrollment?.track_name || 'Track Viva'}
          onBookingSuccess={onRefresh}
        />
      )}
      {showAICoach && (
        <AIVivaCoachModal
          isOpen={true}
          onClose={() => setShowAICoach(false)}
          studentId={student.id}
          studentName={student.name}
        />
      )}
      {showAIForensic && (
        <AIForensicInspectorModal
          isOpen={true}
          onClose={() => setShowAIForensic(false)}
          candidate={student}
        />
      )}
    </div>
  );
};

/* ── Helper: Status Chip ── */
const StatusChip: React.FC<{ status: string; enrollment: any }> = ({ status, enrollment }) => {
  const configs: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
    ELIGIBLE_PENDING_BOOKING: { label: 'Eligible — Booking Required', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', icon: <Sparkles className="w-3.5 h-3.5" /> },
    SLOT_BOOKED: { label: 'Viva Slot Confirmed', color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', icon: <Clock className="w-3.5 h-3.5" /> },
    BADGE_AWARDED: { label: 'Track Badge Earned & Verified', color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    VIVA_FAILED_RETAKE: { label: 'Retake — Cooldown Active', color: '#fbbf24', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.25)', icon: <RotateCcw className="w-3.5 h-3.5" /> },
    BADGE_NULLIFIED_MALPRACTICE: { label: 'Badge Nullified — Integrity Violation', color: '#fda4af', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    SKILLS_IN_PROGRESS: { label: `Prerequisites In Progress (${enrollment?.cleared_skills_count ?? 0}/${enrollment?.total_skills_required ?? 5})`, color: '#71717a', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)', icon: <Lock className="w-3.5 h-3.5" /> },
  };
  const cfg = configs[status] || configs.SKILLS_IN_PROGRESS;
  return (
    <span className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
};

/* ── Helper: Info Block ── */
const InfoBlock: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div className="p-5 rounded-xl space-y-1" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
    <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">
      {icon}
      {label}
    </div>
    {children}
  </div>
);
