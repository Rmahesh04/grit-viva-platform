import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Video, Clock, User, Award, CheckCircle2, RotateCcw, Shield } from 'lucide-react';
import { api } from '../api/client';
import { InterviewerSlot } from '../types/grit';
import { VivaEvaluationModal } from './VivaEvaluationModal';

interface InterviewerScheduleProps {
  interviewerId: string;
  interviewerName: string;
}

export const InterviewerSchedule: React.FC<InterviewerScheduleProps> = ({
  interviewerId,
  interviewerName
}) => {
  const [slots, setSlots] = useState<InterviewerSlot[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roster' | 'availability'>('roster');

  // New slot form state
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newDate, setNewDate] = useState('2026-11-14');
  const [newStartTime, setNewStartTime] = useState('05:00 PM');
  const [newEndTime, setNewEndTime] = useState('05:45 PM');
  const [newMeetingLink, setNewMeetingLink] = useState('https://meet.niatindia.com/grit-viva-room');
  const [formLoading, setFormLoading] = useState(false);

  // Selected booking for evaluation modal
  const [evaluatingBooking, setEvaluatingBooking] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, [interviewerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [slotsRes, scheduleRes] = await Promise.all([
        api.getInterviewerSlots(interviewerId),
        api.getInterviewerSchedule(interviewerId)
      ]);
      setSlots(slotsRes.slots);
      setSchedule(scheduleRes.schedule);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      await api.createSlot({
        interviewerId,
        slotDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        meetingLink: newMeetingLink
      });
      setShowAddSlot(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create slot');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to remove this available slot?')) return;
    try {
      await api.deleteSlot(slotId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete slot');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="luxe-panel p-7 rounded-2xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Calendar className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
                Interviewer Technical Cockpit
              </h1>
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                {interviewerName}
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Manage viva availability, review candidate dossiers, and record accredited outcomes.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              activeTab === 'roster'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today's Viva Roster ({schedule.filter(s => s.booking_status === 'CONFIRMED').length})
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              activeTab === 'availability'
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Manage Availability ({slots.length} Slots)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p>Loading interviewer schedule & candidate queue...</p>
        </div>
      ) : activeTab === 'roster' ? (
        /* ================= VIVA ROSTER VIEW ================= */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">
              Assigned Candidate Viva Sessions
            </h3>
            <span className="text-xs text-slate-400 font-mono">Click "Evaluate Candidate" to open live AI rubric</span>
          </div>

          {schedule.length === 0 ? (
            <div className="p-12 text-center text-slate-500 luxe-panel rounded-3xl">
              No upcoming candidate viva sessions assigned currently.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {schedule.map(item => {
                const isConfirmed = item.booking_status === 'CONFIRMED';
                const isEvaluated = item.evaluation_outcome != null;

                return (
                  <div
                    key={item.booking_id}
          className="luxe-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 hover:border-indigo-500/20 transition"
                  >
                    {/* Candidate Details */}
                    <div className="flex items-start gap-4">
                      <img
                        src={item.student_avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
                        alt={item.student_name}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="font-extrabold text-white text-base font-display">{item.student_name}</h4>
                          <span className="px-2.5 py-0.5 text-xs bg-white/[0.06] text-amber-400 font-mono font-bold rounded-lg border border-white/[0.08]">
                            {item.student_roll}
                          </span>
                          {isEvaluated && (
                            <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full ${
                              item.evaluation_outcome === 'PASS'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {item.evaluation_outcome}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{item.student_headline}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {item.slot_date} at {item.start_time} – {item.end_time}
                          </span>
                          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {item.cleared_skills_count}/5 Skill Contests Cleared
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
                      <a
                        href={item.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 text-indigo-300 text-xs font-bold rounded-xl flex items-center gap-2 transition" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
                      >
                        <Video className="w-4 h-4" />
                        Join Room
                      </a>

                      {isConfirmed && !isEvaluated && (
                        <button
                          onClick={() => setEvaluatingBooking(item)}
                          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition hover:scale-[1.02]"
                        >
                          <Award className="w-4 h-4" />
                          Evaluate Candidate
                        </button>
                      )}

                      {isEvaluated && (
                        <span className="text-xs text-slate-500 font-mono font-medium">Evaluation Recorded</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ================= AVAILABILITY MANAGER VIEW ================= */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-extrabold text-white uppercase tracking-wider">
              Your Published Viva Availability Slots
            </h3>
            <button
              onClick={() => setShowAddSlot(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition"
            >
              <Plus className="w-4 h-4" />
              Add New Slot
            </button>
          </div>

          {/* Add Slot Form */}
          {showAddSlot && (
            <form onSubmit={handleCreateSlot} className="luxe-panel p-6 rounded-2xl space-y-4 animate-fade-in"
              style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
              <h4 className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Clock className="w-4 h-4 text-indigo-400" />
                Add Open Viva Availability Slot
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">Date</label>
                  <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required
                    className="w-full px-3 py-2.5 text-white text-xs rounded-xl" />
                </div>
                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">Start Time</label>
                  <input type="text" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} placeholder="e.g. 11:00 AM" required
                    className="w-full px-3 py-2.5 text-white text-xs rounded-xl" />
                </div>
                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">End Time</label>
                  <input type="text" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} placeholder="e.g. 11:45 AM" required
                    className="w-full px-3 py-2.5 text-white text-xs rounded-xl" />
                </div>
                <div>
                  <label className="block text-zinc-500 mb-1 font-semibold">Meeting Link</label>
                  <input type="url" value={newMeetingLink} onChange={e => setNewMeetingLink(e.target.value)} required
                    className="w-full px-3 py-2.5 text-white text-xs rounded-xl" />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setShowAddSlot(false)}
                  className="px-4 py-2 text-xs text-zinc-500 hover:text-white transition rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading}
                  className="px-5 py-2 text-white font-black rounded-xl text-xs transition"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', opacity: formLoading ? 0.7 : 1 }}>
                  {formLoading ? 'Publishing...' : 'Publish Slot'}
                </button>
              </div>
            </form>
          )}

          {/* Slots Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-xs text-left">
              <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <tr>
                  {['Date','Time Window','Status','Booked Candidate','Actions'].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-600 font-mono ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map(slot => (
                  <tr key={slot.id} className="transition" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-4 font-bold text-white">{slot.slot_date}</td>
                    <td className="px-5 py-4 font-mono font-bold text-amber-400">{slot.start_time} – {slot.end_time}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black"
                        style={{
                          background: slot.status === 'AVAILABLE' ? 'rgba(16,185,129,0.1)' : slot.status === 'BOOKED' ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.04)',
                          color: slot.status === 'AVAILABLE' ? '#34d399' : slot.status === 'BOOKED' ? '#a5b4fc' : '#71717a',
                          border: `1px solid ${slot.status === 'AVAILABLE' ? 'rgba(16,185,129,0.2)' : slot.status === 'BOOKED' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)'}`,
                        }}>
                        {slot.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {slot.student_name ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{slot.student_name}</span>
                          <span className="text-zinc-600 font-mono">({slot.student_roll})</span>
                        </div>
                      ) : (
                        <span className="text-zinc-700 font-mono">— Unbooked —</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {slot.status === 'AVAILABLE' && (
                        <button onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 text-zinc-700 hover:text-rose-400 transition rounded-lg" title="Delete slot">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {evaluatingBooking && (
        <VivaEvaluationModal
          isOpen={true}
          onClose={() => setEvaluatingBooking(null)}
          booking={evaluatingBooking}
          interviewerId={interviewerId}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
