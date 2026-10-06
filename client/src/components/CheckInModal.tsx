import React, { useState } from 'react';
import { Plan, User } from '../types/index.js';
import { api } from '../lib/api.js';
import confetti from 'canvas-confetti';
import { MapPin, CheckCircle2, QrCode, Sparkles, RefreshCw, Users } from 'lucide-react';

interface Props {
  plan: Plan;
  isOpen: boolean;
  onClose: () => void;
  onCheckInCompleted: (updatedPlan: Plan) => void;
}

export const CheckInModal: React.FC<Props> = ({
  plan,
  isOpen,
  onClose,
  onCheckInCompleted,
}) => {
  const [code, setCode] = useState(plan.checkInCode || '4921');
  const [loading, setLoading] = useState(false);
  const [itHappened, setItHappened] = useState(plan.status === 'HAPPENED');

  if (!isOpen) return null;

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const res = await api.checkIn(plan._id, code);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#1746B8', '#F5A623', '#10B981'],
      });

      setItHappened(true);
      setTimeout(() => {
        onCheckInCompleted(res.plan);
      }, 1600);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRepeatCrew = async () => {
    try {
      setLoading(true);
      const res = await api.createRepeatCrew(plan._id);
      alert('Repeat session created for next week with this crew!');
      onClose();
      window.location.href = `/plans/${res.repeatPlan._id}`;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E4E6EB] shadow-2xl p-6 sm:p-7 space-y-4">
        {itHappened ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                North Star Event Reached
              </span>
              <h2 className="text-2xl font-black text-[#111111]">
                ✅ IT HAPPENED!
              </h2>
              <p className="text-xs text-[#666D7A]">
                The plan survived, the team met at {plan.location}, and the session completed.
              </p>
            </div>

            {/* Repeat with this crew banner */}
            <div className="p-4 bg-[#FEF6E9] rounded-2xl border border-amber-200 text-left space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F5A623]" />
                <span className="font-bold text-xs text-amber-950">
                  Play again with this crew?
                </span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                Looks like this group coordinates well together. Lock in a recurring weekly session in one tap.
              </p>
              <button
                onClick={handleRepeatCrew}
                disabled={loading}
                className="w-full bg-[#1746B8] hover:bg-[#123796] text-white font-bold py-2 rounded-xl text-xs press-tactile transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Repeat Session with This Crew</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-[#666D7A] hover:text-[#111111] font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E8EEFB] text-[#1746B8] flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold text-[#1746B8] uppercase tracking-wider">
                  Plan Happening Now
                </span>
                <h3 className="text-lg font-bold text-[#111111]">
                  In-Person Check-In
                </h3>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-[#111111]">
                <MapPin className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>{plan.location}</span>
              </div>
              <p className="text-[#666D7A]">
                Enter the 4-digit plan code below to confirm your presence at the venue.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-[#666D7A] uppercase">
                4-Digit Check-In Code:
              </label>
              <input
                type="text"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl py-3 focus:outline-none focus:border-[#1746B8] focus:ring-2 focus:ring-[#1746B8]/20"
                placeholder="4921"
              />
              <span className="text-[10px] text-[#666D7A] text-center block">
                Host code: <strong className="font-mono text-[#111111]">{plan.checkInCode}</strong>
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#666D7A] hover:text-[#111111]"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckIn}
                disabled={loading || code.length < 4}
                className="bg-[#1746B8] hover:bg-[#123796] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm press-tactile transition-colors cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Check In Now'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
