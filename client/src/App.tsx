import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { InterviewerSchedule } from './components/InterviewerSchedule';
import { AdminOperationsView } from './components/AdminOperationsView';
import { StudentMessagesShowcase } from './components/StudentMessagesShowcase';
import { ArchitectureDocsDrawer } from './components/ArchitectureDocsDrawer';
import { AIVivaCoachModal } from './components/AIVivaCoachModal';
import { AIForensicInspectorModal } from './components/AIForensicInspectorModal';
import { api, SessionData, StudentProfileData } from './api/client';
import { UserRole } from './types/grit';

export function App() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [studentData, setStudentData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [openMessagesModal, setOpenMessagesModal] = useState(false);
  const [openDocsModal, setOpenDocsModal] = useState(false);
  const [openAICoachModal, setOpenAICoachModal] = useState(false);
  const [openAIForensicsModal, setOpenAIForensicsModal] = useState(false);

  useEffect(() => {
    // Remove any stale theme attributes
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.background = '#000000';
    document.body.style.background = '#000000';
    loadInitialSession();
  }, []);

  const loadInitialSession = async () => {
    try {
      setLoading(true);
      const sessionData = await api.getSession();
      setSession(sessionData);
      const profile = await api.getStudentProfile(sessionData.activeSession.studentId);
      setStudentData(profile);
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchRole = async (role: UserRole) => {
    if (!session) return;
    try {
      await api.switchSession({ role });
      setSession({
        ...session,
        activeSession: { ...session.activeSession, role }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSwitchStudent = async (studentId: string) => {
    try {
      setLoading(true);
      await api.switchSession({ studentId, role: 'STUDENT' });
      const [newSession, newProfile] = await Promise.all([
        api.getSession(),
        api.getStudentProfile(studentId)
      ]);
      setSession(newSession);
      setStudentData(newProfile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStudent = async () => {
    if (!session) return;
    try {
      const profile = await api.getStudentProfile(session.activeSession.studentId);
      setStudentData(profile);
      const updatedSession = await api.getSession();
      setSession(updatedSession);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset entire platform database back to initial seed data?')) return;
    try {
      setLoading(true);
      await api.resetDemo();
      await loadInitialSession();
      alert('Database reset to initial seed state!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentRole = session?.activeSession.role || 'STUDENT';

  return (
    <div className="min-h-screen text-slate-100 flex flex-col" style={{ background: '#000000' }}>
      <Navbar
        session={session}
        currentTheme="midnight"
        onThemeChange={() => {}}
        onSwitchRole={handleSwitchRole}
        onSwitchStudent={handleSwitchStudent}
        onOpenMessages={() => setOpenMessagesModal(true)}
        onOpenDocs={() => setOpenDocsModal(true)}
        onOpenAICoach={() => setOpenAICoachModal(true)}
        onOpenAIForensics={() => setOpenAIForensicsModal(true)}
        onResetDemo={handleResetDemo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !studentData ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-500 font-medium">Connecting to NIAT GRIT database...</p>
          </div>
        ) : (
          <>
            {currentRole === 'STUDENT' && studentData && (
              <StudentDashboard
                data={studentData}
                onRefresh={handleRefreshStudent}
                onSelectPersona={handleSwitchStudent}
              />
            )}
            {currentRole === 'INTERVIEWER' && session && (
              <InterviewerSchedule
                interviewerId={session.activeSession.interviewerId}
                interviewerName="Priya Sharma (Staff Engineer)"
              />
            )}
            {currentRole === 'ADMIN' && session && (
              <AdminOperationsView
                adminId={session.activeSession.adminId}
                adminName="Rajesh Kumar"
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-5 text-xs" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.6)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-white" style={{ fontFamily: "'Space Grotesk',sans-serif" }}>NIAT GRIT</span>
            <span className="text-zinc-700">•</span>
            <span className="text-indigo-400 font-semibold">AI Product Engineer — Round 1 Submission</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <button onClick={() => setOpenAICoachModal(true)} className="hover:text-indigo-400 transition">AI Coach</button>
            <button onClick={() => setOpenAIForensicsModal(true)} className="hover:text-rose-400 transition">AST Radar</button>
            <button onClick={() => setOpenDocsModal(true)} className="hover:text-white transition">RFC Docs</button>
            <button onClick={() => setOpenMessagesModal(true)} className="hover:text-amber-400 transition">Student Messages</button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <StudentMessagesShowcase isOpen={openMessagesModal} onClose={() => setOpenMessagesModal(false)} />
      <ArchitectureDocsDrawer isOpen={openDocsModal} onClose={() => setOpenDocsModal(false)} />
      <AIVivaCoachModal
        isOpen={openAICoachModal}
        onClose={() => setOpenAICoachModal(false)}
        studentId={session?.activeSession.studentId || 'std_rahul'}
        studentName={studentData?.student?.name || 'Rahul Verma'}
      />
      <AIForensicInspectorModal
        isOpen={openAIForensicsModal}
        onClose={() => setOpenAIForensicsModal(false)}
        candidate={studentData?.student || { id: 'std_vikram', name: 'Vikram Malhotra', roll_number: 'NIAT23CS0330' }}
      />
    </div>
  );
}

export default App;
