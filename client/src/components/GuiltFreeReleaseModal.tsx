import React, { useState } from 'react';
import { Plan } from '../types/index.js';
import { api } from '../lib/api.js';
import { HeartHandshake, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  plan: Plan;
  isOpen: boolean;
  onClose: () => void;
  onReleased: (updatedPlan: Plan) => void;
}

export const GuiltFreeReleaseModal: React.FC<Props> = ({
  plan,
  isOpen,
  onClose,
  onReleased,
}) => {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleConfirmRelease = async () => {
    try {
      setLoading(true);
      const res = await api.releaseSpot(plan._id);
      setSuccessMsg(true);
      setTimeout(() => {
        onReleased(res.plan);
        onClose();
      }, 1400);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E4E6EB] shadow-2xl p-6 sm:p-7 space-y-4">
        {successMsg ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#111111]">
              Thanks for letting us know early!
            </h3>
            <p className="text-xs text-[#666D7A] leading-relaxed">
              Early notice protects your team. Zero penalty has been recorded to your profile, and the Self-Healing system will immediately offer your spot to a bench backup.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Guilt-Free Release
                </span>
                <h3 className="text-lg font-bold text-[#111111]">
                  Plans change. No excuses required.
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#666D7A] leading-relaxed">
              If your schedule collided or you can no longer attend <span className="font-semibold text-[#111111]">{plan.activity}</span>, releasing now allows the Bench to step in seamlessly.
            </p>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-[#111111] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1746B8] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#1746B8]">Zero penalty guarantee:</strong> Early releases are never penalized. It keeps campus plans honest and self-healing.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-[#666D7A] hover:text-[#111111]"
              >
                Keep my spot
              </button>
              <button
                onClick={handleConfirmRelease}
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-sm press-tactile transition-colors cursor-pointer"
              >
                {loading ? 'Releasing...' : 'Release my spot'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
