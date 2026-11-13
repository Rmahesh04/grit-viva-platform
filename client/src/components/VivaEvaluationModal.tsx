import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, RotateCcw, AlertOctagon, Star, Sparkles, BrainCircuit, Bot, HelpCircle } from 'lucide-react';
import { api } from '../api/client';

interface VivaEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  interviewerId: string;
  onSuccess: () => void;
}

export const VivaEvaluationModal: React.FC<VivaEvaluationModalProps> = ({
  isOpen,
  onClose,
  booking,
  interviewerId,
  onSuccess
}) => {
  const [outcome, setOutcome] = useState<'PASS' | 'RETAKE_LATER' | 'FAIL_UNFIT'>('PASS');
  const [systemDesignScore, setSystemDesignScore] = useState(4);
  const [problemSolvingScore, setProblemSolvingScore] = useState(5);
  const [codeQualityScore, setCodeQualityScore] = useState(4);
  const [rubricFeedback, setRubricFeedback] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Copilot State
  const [aiCopilot, setAiCopilot] = useState<any | null>(null);
  const [aiSynthesizing, setAiSynthesizing] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      loadAICopilot();
    }
  }, [isOpen, booking]);

  const loadAICopilot = async () => {
    try {
      const res = await api.getInterviewerCopilot(booking.student_id);
      setAiCopilot(res.copilot);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAISynthesizeRubric = async () => {
    try {
      setAiSynthesizing(true);
      const res = await api.synthesizeRubric({
        studentName: booking.student_name,
        scores: {
          systemDesign: systemDesignScore,
          problemSolving: problemSolvingScore,
          codeQuality: codeQualityScore
        },
        rawNotes: internalNotes
      });
      setRubricFeedback(res.synthesis.aiSynthesizedFeedback);
      if (res.synthesis.recommendedOutcome) {
        setOutcome(res.synthesis.recommendedOutcome);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiSynthesizing(false);
    }
  };

  if (!isOpen || !booking) return null;

  const handleSubmit = async () => {
    if (!rubricFeedback.trim()) {
      setError('Please provide qualitative rubric feedback for the student.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.recordEvaluation({
        bookingId: booking.booking_id,
        interviewerId,
        studentId: booking.student_id,
        outcome,
        scoreSystemDesign: systemDesignScore,
        scoreProblemSolving: problemSolvingScore,
        scoreCodeQuality: codeQualityScore,
        rubricFeedback,
        internalNotes
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl my-auto bg-[#0a0d16] border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#090D18]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Record Viva Evaluation & Outcome</h2>
                <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold rounded-full border border-cyan-500/30">
                  AI-ASSISTED COCKPIT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Candidate: <strong className="text-white">{booking.student_name}</strong> ({booking.student_roll}) • {booking.track_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl">
              {error}
            </div>
          )}

          {/* AI Interviewer Copilot Card */}
          {aiCopilot && (
            <div className="p-4 bg-gradient-to-r from-cyan-950/30 via-[#121A2D] to-amber-950/20 border border-cyan-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <BrainCircuit className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>AI Copilot: Recommended Codebase Defense Questions</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Tailored to Candidate's Code</span>
              </div>

              <div className="space-y-2">
                {aiCopilot.recommendedDefenseQuestions?.map((q: any) => (
                  <div key={q.id} className="p-2.5 bg-[#090D18] border border-slate-800 rounded-lg flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">Q{q.id}: "{q.question}"</div>
                      <div className="text-[11px] text-slate-400">
                        Target: <span className="text-amber-400 font-mono">{q.evaluationTarget}</span> • Keywords: {q.expectedKeywords.join(', ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInternalNotes(prev => `${prev ? prev + '\n' : ''}Discussed ${q.evaluationTarget}: candidate defended with ${q.expectedKeywords[0]}.`)}
                      className="px-2.5 py-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700 shrink-0"
                    >
                      + Add to Notes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              1. Final Outcome Decision
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOutcome('PASS')}
                className={`p-4 rounded-xl border text-left transition flex flex-col gap-1 ${
                  outcome === 'PASS'
                    ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500 text-white'
                    : 'bg-[#121A2D] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>PASS (Award Badge)</span>
                </div>
                <p className="text-[11px] text-slate-400">Accredited. Mint digital credential immediately.</p>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('RETAKE_LATER')}
                className={`p-4 rounded-xl border text-left transition flex flex-col gap-1 ${
                  outcome === 'RETAKE_LATER'
                    ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500 text-white'
                    : 'bg-[#121A2D] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-amber-400 text-sm">
                  <RotateCcw className="w-4 h-4" />
                  <span>RETAKE LATER</span>
                </div>
                <p className="text-[11px] text-slate-400">Needs focused revision. Imposes 10-day cooling-off window.</p>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('FAIL_UNFIT')}
                className={`p-4 rounded-xl border text-left transition flex flex-col gap-1 ${
                  outcome === 'FAIL_UNFIT'
                    ? 'bg-rose-500/15 border-rose-500 ring-1 ring-rose-500 text-white'
                    : 'bg-[#121A2D] border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
                  <AlertOctagon className="w-4 h-4" />
                  <span>FAIL (Reset Track)</span>
                </div>
                <p className="text-[11px] text-slate-400">Candidate must re-attempt prerequisite contests.</p>
              </button>
            </div>
          </div>

          {/* Rubric Star Ratings */}
          <div className="p-4 bg-[#121A2D] border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Standardized Rubric Scores (1 to 5)
              </label>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">
                Average: {((systemDesignScore + problemSolvingScore + codeQualityScore) / 3).toFixed(1)} / 5.0
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* System Design */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">System Design</span>
                  <span className="font-bold text-amber-400">{systemDesignScore}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSystemDesignScore(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star className={`w-5 h-5 ${star <= systemDesignScore ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Solving */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Problem Solving</span>
                  <span className="font-bold text-amber-400">{problemSolvingScore}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setProblemSolvingScore(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star className={`w-5 h-5 ${star <= problemSolvingScore ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Quality */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Code Architecture</span>
                  <span className="font-bold text-amber-400">{codeQualityScore}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCodeQualityScore(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star className={`w-5 h-5 ${star <= codeQualityScore ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Feedback with AI Synthesis */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                3. Student-Facing Rubric Feedback (Displayed on Dashboard)
              </label>
              <button
                type="button"
                onClick={handleAISynthesizeRubric}
                disabled={aiSynthesizing}
                className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{aiSynthesizing ? 'Synthesizing...' : '✨ AI Auto-Draft Feedback'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={rubricFeedback}
              onChange={e => setRubricFeedback(e.target.value)}
              placeholder="Provide constructive feedback explaining the evaluation decision..."
              className="w-full bg-[#121A2D] border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              4. Raw Viva Observations (Internal Panel Reference)
            </label>
            <input
              type="text"
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
              placeholder="e.g. Defended lock ordering well; answered PostgreSQL isolation levels accurately."
              className="w-full bg-[#121A2D] border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-slate-700"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#090D18] flex items-center justify-between">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-sm transition flex items-center gap-2 shadow-lg"
          >
            {submitting ? 'Submitting Evaluation...' : 'Accredit Decision & Update State'}
          </button>
        </div>
      </div>
    </div>
  );
};
