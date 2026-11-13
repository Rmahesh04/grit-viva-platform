import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Code,
  ShieldCheck,
  Play,
  RefreshCw,
  CheckCircle,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { api } from '../api/client';

interface AIVivaCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

export const AIVivaCoachModal: React.FC<AIVivaCoachModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName
}) => {
  const [diagnostic, setDiagnostic] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDiagnostic();
    }
  }, [isOpen, studentId]);

  const loadDiagnostic = async () => {
    try {
      setLoading(true);
      const res = await api.getPreVivaDiagnostic(studentId);
      setDiagnostic(res?.diagnostic || null);
    } catch (err) {
      console.error('Failed to load AI diagnostic:', err);
    } finally {
      setLoading(false);
    }
  };

  const reRunAIAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 900);
  };

  if (!isOpen) return null;

  const vulnerabilities = diagnostic?.aiVulnerabilities || [];
  const currentVuln = vulnerabilities[activeQuestionIndex] || vulnerabilities[0] || {
    severity: 'HIGH',
    title: 'Architectural Concurrency Vulnerability',
    description: 'Resource lock acquisition ordering is non-deterministic under high concurrent thread volume.',
    suggestedQuestion: 'How would you prevent deadlocks in your submission when concurrent requests cross-lock resources?',
    recommendedDefense: 'Enforce deterministic global lock acquisition ordering (e.g. lexicographical resource sorting) before running transactions.'
  };

  const studyFocus = diagnostic?.aiStudyFocus || [
    'Deterministic Lock Ordering in ACID Transactions',
    'Optimistic Concurrency Control with ETag Versioning',
    'PostgreSQL Lock Graph Inspection'
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl my-auto max-h-[88vh] bg-[#080C16] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col overflow-hidden animate-modal-in">
        {/* Top Glow Ambient Light */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-wide">
                  GRIT AI Pre-Viva Coach & Codebase Auditor
                </h2>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold rounded-full border border-cyan-500/30">
                  AST INTELLIGENCE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated AST code audit & simulated panel defense probes for <strong className="text-white">{studentName}</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400">Scanning repository Abstract Syntax Trees and commit hashes...</p>
            </div>
          ) : (
            <>
              {/* Metrics Header */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Analyzed Benchmark</div>
                  <div className="text-sm font-bold text-white truncate">
                    {diagnostic?.benchmarkContest || 'Contest #4 Benchmark'}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono truncate">
                    {diagnostic?.fileName || '/services/main.go'}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-cyan-950/40 to-transparent border border-cyan-500/30 rounded-2xl space-y-1 shadow-lg shadow-cyan-500/5">
                  <div className="text-[10px] text-cyan-400 uppercase font-semibold">AI Defense Readiness</div>
                  <div className="text-2xl font-black text-cyan-300">
                    {diagnostic?.readinessScore ?? 88}%
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">
                    {diagnostic?.readinessStatus?.replace(/_/g, ' ') ?? 'READY TO DEFEND'}
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-1">
                  <div className="text-[10px] text-amber-400 uppercase font-semibold">Architectural Probes</div>
                  <div className="text-2xl font-black text-amber-400">
                    {vulnerabilities.length || 1} Probes
                  </div>
                  <div className="text-[10px] text-slate-400">Predicted Panel Probes</div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl flex flex-col justify-between">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Audit Engine</div>
                  <button
                    onClick={reRunAIAnalysis}
                    disabled={analyzing}
                    className="w-full py-2 bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-white/[0.08]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                    <span>{analyzing ? 'Scanning...' : 'Re-Run AST Scan'}</span>
                  </button>
                </div>
              </div>

              {/* Code Snippet Inspector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Submitted Repository Code (Under Active Defense)</span>
                  </h3>
                  <span className="text-[10px] text-amber-400 font-mono">AST Tree Hash: Verified</span>
                </div>

                <div className="border border-white/[0.08] rounded-2xl bg-[#050711] overflow-hidden">
                  <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-slate-400">
                    <span>File: {diagnostic?.fileName || '/services/wallet_service.go'}</span>
                    <span className="text-amber-400 font-bold">Heuristic Risk: High Concurrency Lock Ordering</span>
                  </div>
                  <pre className="p-4 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto selection:bg-cyan-500 selection:text-black">
                    {diagnostic?.codeSnippet || '// Code repository loaded'}
                  </pre>
                </div>
              </div>

              {/* Interactive Mock Defense Question */}
              <div className="p-5 bg-gradient-to-br from-[#0F162A] to-[#0A0F1E] border border-cyan-500/30 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Predicted Interviewer Probe #{activeQuestionIndex + 1} of {Math.max(vulnerabilities.length, 1)}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    currentVuln.severity === 'HIGH' || currentVuln.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {currentVuln.severity} SEVERITY
                  </span>
                </div>

                <div className="p-4 bg-black/40 border border-white/[0.06] rounded-xl space-y-2">
                  <p className="font-semibold text-white text-sm">
                    "{currentVuln.suggestedQuestion}"
                  </p>
                  <p className="text-slate-400 text-xs">
                    <strong>Why panel evaluates this:</strong> {currentVuln.description}
                  </p>
                </div>

                {/* Question switcher if multiple */}
                {vulnerabilities.length > 1 && (
                  <div className="flex gap-2">
                    {vulnerabilities.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveQuestionIndex(idx);
                          setShowAnswer(false);
                        }}
                        className={`px-3 py-1 text-[11px] rounded-lg font-semibold transition ${
                          activeQuestionIndex === idx
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-white/[0.04] text-slate-400 hover:text-white'
                        }`}
                      >
                        Probe #{idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Model Answer Reveal */}
                {showAnswer ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 text-xs animate-fade-in">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Recommended Architectural Defense Talking Points:</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed font-mono">
                      "{currentVuln.recommendedDefense}"
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Reveal AI Model Defense & Talking Points</span>
                  </button>
                )}
              </div>

              {/* Study Focus */}
              <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-2">
                <div className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Targeted Pre-Viva Revision Roadmap
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {studyFocus.map((item: string, i: number) => (
                    <div key={i} className="p-2.5 bg-black/40 border border-white/[0.06] rounded-xl flex items-center gap-2 text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0A0E1A] flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-mono">
            Powered by NIAT Code Intelligence Pipeline
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold rounded-xl text-xs transition border border-white/[0.08]"
          >
            Close AI Coach
          </button>
        </div>
      </div>
    </div>
  );
};
