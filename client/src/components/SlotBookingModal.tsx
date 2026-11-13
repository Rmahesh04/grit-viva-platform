import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import { api } from '../api/client';
import { InterviewerSlot } from '../types/grit';

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  trackName: string;
  onBookingSuccess: () => void;
}

export const SlotBookingModal: React.FC<SlotBookingModalProps> = ({
  isOpen,
  onClose,
  enrollmentId,
  studentId,
  studentName,
  trackName,
  onBookingSuccess
}) => {
  const [slots, setSlots] = useState<InterviewerSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<InterviewerSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSlots();
      setConfirmationData(null);
      setSelectedSlot(null);
      setError(null);
    }
  }, [isOpen]);

  const loadSlots = async () => {
    try {
      setLoading(true);
      const res = await api.getAvailableSlots('trk_fullstack');
      setSlots(res.slots);
      if (res.slots.length > 0) {
        // Unique dates
        const dates = Array.from(new Set(res.slots.map(s => s.slot_date))).sort();
        setSelectedDate(dates[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load open interview slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    try {
      setBookingLoading(true);
      setError(null);
      const res = await api.bookSlot({
        enrollmentId,
        slotId: selectedSlot.id,
        studentId
      });
      setConfirmationData({
        ...selectedSlot,
        bookingId: res.booking.bookingId
      });
      onBookingSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!isOpen) return null;

  const dates = Array.from(new Set(slots.map(s => s.slot_date))).sort();
  const filteredSlots = slots.filter(s => s.slot_date === selectedDate);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-3xl my-auto bg-[#0a0d16] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0B0F19]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Book Your Track Badge Viva</h2>
              <p className="text-xs text-slate-400">{trackName} • 45-Minute Live Technical Defense</p>
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
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {confirmationData ? (
            /* Successful Booking View (Shows Student Message #1) */
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-emerald-300">Viva Slot Successfully Reserved!</h3>
                  <p className="text-xs text-emerald-400/90">
                    Your interview slot has been locked in the NIAT database. Below is your official confirmation message.
                  </p>
                </div>
              </div>

              {/* Exact Student Message #1 Box */}
              <div className="border border-slate-700 rounded-xl bg-[#080C14] p-5 font-mono text-xs text-slate-200 space-y-3 leading-relaxed">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-amber-400 font-bold">STUDENT MESSAGE #1 (IN-APP CONFIRMATION)</span>
                  <span className="text-slate-500 text-[11px]">Delivered to {studentName}</span>
                </div>
                <p className="text-white font-bold">🎯 Your GRIT Track Badge Viva is Confirmed!</p>
                <p>Hi {studentName},</p>
                <p>
                  Congratulations on clearing all 5 prerequisite skill contests for the {trackName}!
                  Your final viva interview has been scheduled with <strong>{confirmationData.interviewer_name}</strong> ({confirmationData.interviewer_headline}).
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1">
                  <p>📅 <strong>Date:</strong> {confirmationData.slot_date}</p>
                  <p>⏰ <strong>Time:</strong> {confirmationData.start_time} – {confirmationData.end_time} IST (45 mins)</p>
                  <p>📍 <strong>Interview Link:</strong> <a href={confirmationData.meeting_link} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{confirmationData.meeting_link}</a></p>
                  <p>📋 <strong>Evaluator Focus:</strong> System Design, Frontend Architecture, RDBMS Concurrency & Live Code Defense.</p>
                </div>
                <p className="text-slate-400">
                  Important: Rescheduling is permitted up to 6 hours before the slot. Best of luck!
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p>Fetching real-time interviewer availability slots...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-600" />
              <p className="font-semibold text-slate-300">No open slots available right now</p>
              <p className="text-xs">Interviewers add new availability daily. Please check back shortly or notify ops.</p>
            </div>
          ) : (
            /* Slot Selection Workflow */
            <div className="space-y-6">
              {/* Date Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  1. Select Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dates.map(date => {
                    const isSelected = date === selectedDate;
                    const count = slots.filter(s => s.slot_date === date).length;
                    return (
                      <button
                        key={date}
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedSlot(null);
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-left transition shrink-0 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                            : 'bg-[#131B2E] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold">{date}</div>
                        <div className="text-[11px] text-slate-500">{count} slots available</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  2. Choose Slot & Interviewer ({filteredSlots.length} available)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSlots.map(slot => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                            : 'bg-[#131B2E] border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={slot.interviewer_avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                              alt={slot.interviewer_name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <h4 className="font-semibold text-white text-sm">{slot.interviewer_name}</h4>
                              <p className="text-[11px] text-slate-400">{slot.interviewer_headline}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Available
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{slot.start_time} – {slot.end_time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                            <Video className="w-3.5 h-3.5 text-cyan-400" />
                            <span>45m Live Viva</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Slot Summary & Action */}
              {selectedSlot && (
                <div className="p-4 bg-[#131B2E] border border-amber-500/30 rounded-xl flex items-center justify-between flex-wrap gap-4 animate-fade-in">
                  <div>
                    <div className="text-xs text-slate-400">Selected Viva Slot:</div>
                    <div className="text-sm font-bold text-white">
                      {selectedSlot.slot_date} at {selectedSlot.start_time} with {selectedSlot.interviewer_name}
                    </div>
                  </div>
                  <button
                    onClick={handleBook}
                    disabled={bookingLoading}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-sm transition flex items-center gap-2 shadow-lg"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                        <span>Confirming...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Confirm Booking</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

