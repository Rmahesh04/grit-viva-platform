import React, { useState } from 'react';
import {
  Award,
  Users,
  Calendar,
  Shield,
  FileText,
  Mail,
  RotateCcw,
  BrainCircuit,
  Fingerprint,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../types/grit';
import { SessionData } from '../api/client';

interface NavbarProps {
  session: SessionData | null;
  currentTheme: 'midnight' | 'obsidian' | 'cyber' | 'emerald';
  onThemeChange: (theme: 'midnight' | 'obsidian' | 'cyber' | 'emerald') => void;
  onSwitchRole: (role: UserRole) => void;
  onSwitchStudent: (studentId: string) => void;
  onOpenMessages: () => void;
  onOpenDocs: () => void;
  onOpenAICoach: () => void;
  onOpenAIForensics: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onSwitchRole,
  onOpenMessages,
  onOpenDocs,
  onOpenAICoach,
  onOpenAIForensics,
  onResetDemo
}) => {
  const currentRole = session?.activeSession.role || 'STUDENT';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06]"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px] gap-4">

          {/* ── Brand ── */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  GRIT
                </span>
                <span className="hidden sm:inline px-2 py-0.5 text-[10px] rounded-md font-mono font-bold"
                  style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                  NIAT PLATFORM
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-zinc-500 leading-none mt-0.5">
                Track Badge Viva &amp; Integrity OS
              </p>
            </div>
          </div>

          {/* ── Role Switcher Pills ── */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {([
              { role: 'STUDENT' as UserRole, label: 'Student', icon: Users, activeColor: 'from-amber-500 to-amber-600', activeText: 'text-black' },
              { role: 'INTERVIEWER' as UserRole, label: 'Interviewer', icon: Calendar, activeColor: 'from-indigo-500 to-indigo-600', activeText: 'text-white' },
              { role: 'ADMIN' as UserRole, label: 'Admin', icon: Shield, activeColor: 'from-emerald-500 to-teal-600', activeText: 'text-black' },
            ] as const).map(({ role, label, icon: Icon, activeColor, activeText }) => (
              <button
                key={role}
                onClick={() => onSwitchRole(role)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  currentRole === role
                    ? `bg-gradient-to-r ${activeColor} ${activeText} shadow-lg`
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex items-center gap-2">
            {/* AI Coach */}
            <button
              onClick={onOpenAICoach}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
              title="AI Pre-Viva Coach & Codebase Auditor"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">AI Coach</span>
            </button>

            {/* AI Forensics */}
            <button
              onClick={onOpenAIForensics}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: 'rgba(244,63,94,0.1)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.2)' }}
              title="AI AST Forensics Radar"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">AST Radar</span>
            </button>

            {/* Messages */}
            <button
              onClick={onOpenMessages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
              style={{ background: 'rgba(245,158,11,0.1)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}
              title="3 Student Messages (Verbatim)"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Messages</span>
            </button>

            {/* RFC Docs */}
            <button
              onClick={onOpenDocs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
              title="2-Page RFC Architecture Write-up"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">RFC</span>
            </button>

            {/* Reset DB */}
            <button
              onClick={onResetDemo}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ color: '#52525b', border: '1px solid rgba(255,255,255,0.06)' }}
              title="Reset database to demo seeds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
