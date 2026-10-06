import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plan } from '../types/index.js';
import { api } from '../lib/api.js';
import confetti from 'canvas-confetti';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Armchair,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Zap,
  Sparkles,
} from 'lucide-react';

interface Props {
  plan: Plan;
  isOpen: boolean;
  onClose: () => void;
  onPlanRestored: (updatedPlan: Plan) => void;
}

export const SelfHealingModal: React.FC<Props> = ({
  plan,
  isOpen,
  onClose,
  onPlanRestored,
}) => {
  const [step, setStep] = useState<'AT_RISK' | 'SCANNING' | 'BACKUP_FOUND' | 'OFFERED' | 'RESTORED'>(
    'AT_RISK'
  );
  const [recoveryData, setRecoveryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadRecoveryDetails();
    } else {
      setStep('AT_RISK');
    }
  }, [isOpen, plan._id]);

  const loadRecoveryDetails = async () => {
    try {
      const data = await api.getRecoveryStatus(plan._id);
      setRecoveryData(data);
      if (data.currentlyOffered) {
        setStep('OFFERED');
      } else {
        setStep('AT_RISK');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartRecoveryScan = () => {
    setStep('SCANNING');
    setTimeout(() => {
      setStep('BACKUP_FOUND');
    }, 1400);
  };

  const handleOfferSlot = async () => {
    try {
      setLoading(true);
      const targetUserId = recoveryData?.eligibleBackups?.[0]?.userId;
      await api.offerBackupSlot(plan._id, targetUserId);
      setStep('OFFERED');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackupAccepts = async () => {
    try {
      setLoading(true);
      const targetUserId =
        recoveryData?.currentlyOffered?.userId || recoveryData?.eligibleBackups?.[0]?.userId;
      const res = await api.acceptBackupSlot(plan._id, targetUserId);

      // Trigger North Star celebration particles!
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1746B8', '#F5A623', '#10B981'],
      });

      setStep('RESTORED');
      setTimeout(() => {
        onPlanRestored(res.plan);
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const topCandidate =
    recoveryData?.currentlyOffered || recoveryData?.eligibleBackups?.[0] || {
      name: 'Kabir Verma',
      branch: 'Computer Science & Engineering',
      year: '3rd Year',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      campusZone: 'Hostel 7',
      fitReasons: [
        'Role match: UI / UX & Figma prototyping',
        'Available Saturday at 10:00 AM',
        'Campus zone: Main Block / Hostel 7',
        '4 completed bench step-ins with zero no-shows',
      ],
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E4E6EB] shadow-2xl overflow-hidden relative">
        {/* Header Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-[#1746B8]" />

        <div className="p-6 sm:p-7">
          <AnimatePresence mode="wait">
            {/* STEP 1: AT RISK WARNING */}
            {step === 'AT_RISK' && (
              <motion.div
                key="at-risk"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold text-rose-600 uppercase tracking-wider">
                      ⚠ Plan At Risk
                    </span>
                    <h2 className="text-xl font-bold text-[#111111]">
                      Slot released. Plan requires backup.
                    </h2>
                  </div>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-sm text-[#111111] space-y-1">
                  <p className="font-medium">
                    A committed student released their <span className="font-semibold text-[#1746B8]">{plan.role}</span> spot.
                  </p>
                  <p className="text-xs text-[#666D7A]">
                    Campus 2.0 does not abandon the plan. We inspect verified students on the Bench to self-heal the group immediately.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-[#666D7A] hover:text-[#111111]"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleStartRecoveryScan}
                    className="bg-[#1746B8] hover:bg-[#123796] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md press-tactile flex items-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-[#F5A623]" />
                    <span>Inspect Bench Backups</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SCANNING RADAR */}
            {step === 'SCANNING' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-8 text-center space-y-5"
              >
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-[#1746B8]/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-[#1746B8]/40 animate-pulse" />
                  <div className="w-12 h-12 rounded-full bg-[#1746B8] flex items-center justify-center text-white shadow-lg">
                    <Search className="w-6 h-6 animate-spin text-[#F5A623]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#111111]">
                    Finding Next Eligible Backup...
                  </h3>
                  <p className="text-xs text-[#666D7A] font-mono">
                    Filtering role fit · availability · proximity · participation history
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: BACKUP FOUND & MATCH EXPLANATION */}
            {step === 'BACKUP_FOUND' && (
              <motion.div
                key="found"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Eligible Backup Identified
                  </span>
                  <span className="text-xs text-[#666D7A] font-mono">Priority #1 on Bench</span>
                </div>

                {/* Candidate Card */}
                <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#E4E6EB] space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={topCandidate.avatar}
                      alt={topCandidate.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#1746B8]/30 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-base text-[#111111]">{topCandidate.name}</h4>
                        <ShieldCheck className="w-4 h-4 text-[#1746B8]" />
                      </div>
                      <p className="text-xs text-[#666D7A]">
                        {topCandidate.branch} · {topCandidate.year}
                      </p>
                    </div>
                  </div>

                  {/* Why matched signals */}
                  <div className="pt-2 border-t border-[#E4E6EB]/80 space-y-1.5">
                    <span className="text-[11px] font-mono uppercase text-[#666D7A] font-bold block">
                      Deterministic Match Fit:
                    </span>
                    {(topCandidate.fitReasons || []).map((reason: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-[#111111]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-[#666D7A] hover:text-[#111111]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOfferSlot}
                    disabled={loading}
                    className="bg-[#1746B8] hover:bg-[#123796] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md press-tactile flex items-center gap-2 cursor-pointer"
                  >
                    <span>Offer Slot to {topCandidate.name.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4 text-[#F5A623]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: OFFER SENT -> SIMULATE ACCEPTANCE */}
            {step === 'OFFERED' && (
              <motion.div
                key="offered"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="text-center py-2 space-y-1">
                  <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                    Slot Offered · Awaiting Step-In
                  </span>
                  <h3 className="text-lg font-bold text-[#111111] mt-2">
                    Notification dispatched to {topCandidate.name}
                  </h3>
                  <p className="text-xs text-[#666D7A]">
                    {topCandidate.name} is given first notice to accept the open spot.
                  </p>
                </div>

                <div className="p-4 bg-[#FEF6E9] rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#F5A623]" />
                    Interactive Judge Simulation:
                  </p>
                  <p>
                    Click below to simulate {topCandidate.name.split(' ')[0]} instantly accepting the backup offer and restoring the group!
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-[#666D7A] hover:text-[#111111]"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleBackupAccepts}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md press-tactile flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-200" />
                    <span>{topCandidate.name.split(' ')[0]} Accepts Slot</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: RESTORED SUCCESS */}
            {step === 'RESTORED' && (
              <motion.div
                key="restored"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="py-6 text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-md">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold text-emerald-600 uppercase tracking-widest">
                    Self-Healing Complete
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#111111]">
                    PLAN RESTORED
                  </h3>
                  <p className="text-sm font-semibold text-[#1746B8]">
                    {plan.requiredSpots} / {plan.requiredSpots} spots committed · Group survives!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
