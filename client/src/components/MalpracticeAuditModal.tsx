import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, FileWarning, Check } from 'lucide-react';
import { api } from '../api/client';

interface MalpracticeAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  adminId: string;
  onSuccess: () => void;
}

export const MalpracticeAuditModal: React.FC<MalpracticeAuditModalProps> = ({
  isOpen,
  onClose,
  candidate,
  adminId,
  onSuccess
}) => {
  const [violationType, setViolationType] = useState('Plagiarism & External Code Ingestion');
  const [evidenceSummary, setEvidenceSummary] = useState(
    'Automated NIAT AST Code Similarity Engine flagged submission for Contest #4 (Database Concurrency) with a 94.2% match against an external uncredited codebase. Forensic review confirmed identical variable semantics and AST hash.'
  );
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !candidate) return null;

  const handleFlag = async () => {
    if (confirmText !== 'REVOKE') {
      setError('Please type REVOKE in capital letters to confirm.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.flagMalpractice({
        enrollmentId: candidate.enrollment_id,
        studentId: candidate.student_id,
        adminId,
        violationType,
        evidenceSummary
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to flag malpractice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl my-auto bg-[#0a0d16] border border-rose-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-rose-500/20 bg-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Flag Malpractice & Revoke Track Badge</h2>
              <p className="text-xs text-rose-300">
                Candidate: <strong className="text-white">{candidate.name}</strong> ({candidate.roll_number}) • Credential: <code className="text-rose-300 font-mono">{candidate.badge_credential_id || 'ACTIVE'}</code>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-lg">
              {error}
            </div>
          )}

          <div className="p-4 bg-[#131B2E] border border-rose-500/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Consequences of this action:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>Track Badge status immediately transitions to <code className="text-rose-400">BADGE_NULLIFIED_MALPRACTICE</code>.</li>
              <li>Verification credential is permanently voided in the public registry.</li>
              <li>Student dashboard displays <strong>Student Message #3: Academic Integrity Violation Alert</strong>.</li>
              <li>A permanent audit trail is inscribed in <code className="text-rose-400">malpractice_audit_logs</code>.</li>
            </ul>
          </div>

          {/* Violation Type */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
              Violation Category
            </label>
            <select
              value={violationType}
              onChange={e => setViolationType(e.target.value)}
              className="w-full bg-[#131B2E] border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-rose-500"
            >
              <option value="Plagiarism & External Code Ingestion">Plagiarism & External Code Ingestion (AST similarity &gt; 85%)</option>
              <option value="Proctoring & Identity Impersonation">Proctoring & Identity Impersonation Breach</option>
              <option value="Unauthorized External Assistance in Live Viva">Unauthorized Live Viva Assistance</option>
              <option value="Benchmark Contest Tampering">Benchmark Contest Telemetry Tampering</option>
            </select>
          </div>

          {/* Forensic Evidence Summary */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
              Forensic Evidence & Audit Notes
            </label>
            <textarea
              rows={3}
              value={evidenceSummary}
              onChange={e => setEvidenceSummary(e.target.value)}
              className="w-full bg-[#131B2E] border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          {/* Safety Confirmation */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="block font-bold text-rose-400 uppercase tracking-wider text-[11px]">
              Type "REVOKE" to execute permanent nullification:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="REVOKE"
              className="w-full bg-[#131B2E] border border-rose-500/50 rounded-xl p-2.5 text-white font-mono uppercase tracking-widest text-center"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0F19] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleFlag}
            disabled={loading || confirmText !== 'REVOKE'}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold rounded-lg text-xs transition flex items-center gap-2 shadow-lg"
          >
            {loading ? 'Revoking...' : 'Execute Badge Nullification'}
          </button>
        </div>
      </div>
    </div>
  );
};

