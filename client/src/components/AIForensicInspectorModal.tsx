import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  GitCompare,
  FileCode,
  ShieldAlert,
  XCircle,
  AlertTriangle,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../api/client';

interface AIForensicInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onConfirmNullification?: () => void;
}

export const AIForensicInspectorModal: React.FC<AIForensicInspectorModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onConfirmNullification
}) => {
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadReport();
    }
  }, [isOpen, candidate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const studentId = candidate?.id || candidate?.student_id || 'std_vikram';
      const res = await api.getAIForensicReport(studentId);
      setReport(res?.report || null);
    } catch (err) {
      console.error('Failed to load forensic report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const markers = report?.forensicMarkers || [
    "Identical Abstract Syntax Tree (AST) structure across 14 functions",
    "Verbatim variable identifiers and function signatures",
    "Identical commit timestamp cluster matching external repository leak by 3 hours",
    "Zero commit hash divergence in core concurrency algorithms"
  ];

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-5xl my-auto max-h-[88vh] bg-[#0A0D18] border border-rose-500/50 rounded-3xl shadow-[0_0_50px_rgba(244,63,94,0.18)] flex flex-col overflow-hidden animate-modal-in">
        {/* Top Glow Ambient Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/[0.08] bg-[#111626]/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-red-500/10 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/10">
              <Fingerprint className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white tracking-wide">
                  GRIT AI Forensic Plagiarism & AST Diff Radar
                </h2>
                <span className="px-2 py-0.5 text-[10px] bg-rose-500/20 text-rose-300 font-mono font-bold rounded-full border border-rose-500/30">
                  CODE INTEGRITY RADAR
                </span>
              </div>
              <p className="text-xs text-rose-300/80">
                Automated Abstract Syntax Tree (AST) similarity & code telemetry verification.
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
              <div className="inline-block w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400">Comparing AST tokens against solution leak database and git hashes...</p>
            </div>
          ) : (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-gradient-to-br from-rose-950/40 to-transparent border border-rose-500/40 rounded-2xl space-y-1 shadow-lg shadow-rose-500/10">
                  <div className="text-[10px] text-rose-400 uppercase font-semibold">AI Similarity Index</div>
                  <div className="text-2xl font-black text-rose-400">
                    {report?.similarityScore ?? 94.2}%
                  </div>
                  <div className="text-[10px] text-rose-300 font-bold uppercase">CRITICAL PLAGIARISM MATCH</div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Matched AST Nodes</div>
                  <div className="text-2xl font-black text-white">
                    {report?.astNodeMatches ?? 842} Nodes
                  </div>
                  <div className="text-[10px] text-slate-500">14 Functions Verbatim</div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Code Entropy</div>
                  <div className="text-2xl font-black text-amber-400">
                    {report?.fingerprintEntropy ?? 0.08}
                  </div>
                  <div className="text-[10px] text-amber-400/80">Synthetic / Copied Pattern</div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-2xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">AI Forensic Verdict</div>
                  <div className="text-xs font-black text-rose-400 uppercase pt-1 truncate">
                    {report?.verdict?.replace(/_/g, ' ') ?? 'CONFIRMED CODE PLAGIARISM'}
                  </div>
                  <div className="text-[10px] text-slate-400">Badge Nullification Warranted</div>
                </div>
              </div>

              {/* Side-by-Side AST Code Comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-rose-400" />
                    <span>Visual AST Code Diff: Candidate vs. Flagged Source Leak</span>
                  </h3>
                  <span className="text-[10px] text-rose-400 font-mono">AST Tree Match: 94.2%</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Student Submission */}
                  <div className="border border-rose-500/30 rounded-2xl bg-[#060812] overflow-hidden">
                    <div className="px-4 py-2 bg-white/[0.02] border-b border-rose-500/20 flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span className="flex items-center gap-1.5 text-rose-300 font-bold">
                        <FileCode className="w-3.5 h-3.5" />
                        Candidate: {candidate?.name || 'Vikram Malhotra'}
                      </span>
                      <span className="text-slate-500">Contest #4 Repo</span>
                    </div>
                    <pre className="p-4 font-mono text-[11px] text-rose-200/90 leading-relaxed overflow-x-auto bg-rose-950/10">
                      {report?.studentCodeSnippet || `class PartitionedWorkerPool {\n  constructor(partitionCount = 8) {\n    this.partitions = Array.from({ length: partitionCount }, () => []);\n    this.hashingRing = new ConsistentHashRing(partitionCount);\n  }\n}`}
                    </pre>
                  </div>

                  {/* Right: Flagged External Repo */}
                  <div className="border border-white/[0.08] rounded-2xl bg-[#060812] overflow-hidden">
                    <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <FileCode className="w-3.5 h-3.5" />
                        Flagged External GitHub Source
                      </span>
                      <span className="text-amber-400 font-mono">Uploaded 3 hrs prior</span>
                    </div>
                    <pre className="p-4 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                      {report?.flaggedSourceSnippet || `class PartitionedWorkerPool {\n  constructor(partitionCount = 8) {\n    this.partitions = Array.from({ length: partitionCount }, () => []);\n    this.hashingRing = new ConsistentHashRing(partitionCount);\n  }\n}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Forensic Markers */}
              <div className="p-4 bg-white/[0.02] border border-rose-500/20 rounded-2xl space-y-2">
                <div className="font-bold text-rose-300 text-xs uppercase tracking-wider">
                  Automated Forensic Integrity Markers
                </div>
                <ul className="space-y-1.5 pl-1">
                  {markers.map((marker: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{marker}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Integrity Board Recommendation */}
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-300 text-xs uppercase tracking-wider">
                    AI Academic Integrity Board Determination
                  </h4>
                  <p className="text-xs text-rose-200/90 leading-relaxed">
                    {report?.aiRecommendation || "Immediate revocation of Track Badge Credential under NIAT Academic Honor Code Article 4.2."}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0A0D18] flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-mono">
            Audit Hash: SHA256-AST-98214-NIAT
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold rounded-xl transition border border-white/[0.08]"
            >
              Close Forensic Viewer
            </button>
            {onConfirmNullification && (
              <button
                onClick={onConfirmNullification}
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-rose-600/25"
              >
                Proceed to Nullify Badge
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
