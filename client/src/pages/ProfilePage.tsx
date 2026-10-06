import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { ShieldCheck, Calendar, Lock, CheckCircle2, Clock, AlertCircle, HeartHandshake, Shield } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?._id) {
      loadProfileData();
    }
  }, [currentUser]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const res = await api.getUserProfile(currentUser!._id);
      setProfileData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const history = currentUser.participationHistory;
  const privateRel = profileData?.privateHistory?.reliability;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Identity Card */}
      <section className="bg-white rounded-3xl border border-[#E4E6EB] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-[#1746B8]/30 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
                {currentUser.name}
              </h1>
              {currentUser.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1746B8] bg-[#E8EEFB] px-2 py-0.5 rounded-full border border-[#1746B8]/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1746B8]" />
                  <span>Verified Student</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#666D7A] font-medium">
              {currentUser.branch} · {currentUser.year}
            </p>
            <span className="text-xs text-[#111111] block font-mono">
              📍 Primary Zone: {currentUser.campusZone}
            </span>
          </div>
        </div>

        {/* Roles & Skillset */}
        <div className="space-y-1.5 sm:text-right">
          <span className="text-[10px] font-mono uppercase font-bold text-[#666D7A] block">
            Declared Campus Roles
          </span>
          <div className="flex flex-wrap sm:justify-end gap-1.5">
            {currentUser.roles.map((r, i) => (
              <span
                key={i}
                className="text-xs font-semibold bg-[#FAFAF8] text-[#111111] border border-[#E4E6EB] px-2.5 py-1 rounded-xl"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PRIVATE PARTICIPATION HISTORY (Rule 21 & 23: NEVER A PUBLIC SCORE!) */}
      <section className="bg-white rounded-3xl border border-[#E4E6EB] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-[#E4E6EB] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#1746B8]" />
              <h2 className="text-lg font-bold text-[#111111]">
                Private Participation History
              </h2>
            </div>
            <p className="text-xs text-[#666D7A] mt-0.5">
              Strictly visible only to you. Campus 2.0 rejects public numerical ratings and follower scores.
            </p>
          </div>

          <span className="font-mono text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            Private To You
          </span>
        </div>

        {/* Breakdown Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-[#FAFAF8] rounded-2xl border border-[#E4E6EB]">
            <span className="text-[10px] font-mono uppercase text-[#666D7A] block">Completed Plans</span>
            <strong className="text-xl font-mono font-black text-[#111111] mt-0.5 block">
              {history.completedCount}
            </strong>
            <span className="text-[10px] text-emerald-600 font-medium">Strong follow-through</span>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] rounded-2xl border border-[#E4E6EB]">
            <span className="text-[10px] font-mono uppercase text-[#666D7A] block">Bench Step-Ins</span>
            <strong className="text-xl font-mono font-black text-[#1746B8] mt-0.5 block">
              {history.benchStepInCount}
            </strong>
            <span className="text-[10px] text-[#1746B8] font-medium">Clutch backup credit</span>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] rounded-2xl border border-[#E4E6EB]">
            <span className="text-[10px] font-mono uppercase text-[#666D7A] block">Early Releases</span>
            <strong className="text-xl font-mono font-black text-[#111111] mt-0.5 block">
              {history.earlyReleaseCount}
            </strong>
            <span className="text-[10px] text-[#666D7A] font-medium">Never penalized</span>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] rounded-2xl border border-[#E4E6EB]">
            <span className="text-[10px] font-mono uppercase text-[#666D7A] block">Reliability Standing</span>
            <strong className="text-sm font-bold text-emerald-700 mt-2 block">
              High Priority
            </strong>
            <span className="text-[10px] text-[#666D7A]">For future backup offers</span>
          </div>
        </div>

        {/* Rule-based Explanation */}
        <div className="p-4 bg-[#E8EEFB]/40 rounded-2xl border border-[#1746B8]/20 space-y-2 text-xs">
          <span className="font-mono text-[10px] uppercase font-bold text-[#1746B8] block">
            How Campus 2.0 Treats Your Data:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#111111]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
              <span><strong>Attended Sessions:</strong> Boost priority when you need a backup.</span>
            </div>
            <div className="flex items-start gap-2">
              <HeartHandshake className="w-3.5 h-3.5 text-[#1746B8] mt-0.5 shrink-0" />
              <span><strong>Early Releases:</strong> Never penalized. Gives your group time to heal.</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <span><strong>Late Releases:</strong> Modestly lowers priority for automated bench offers.</span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-stone-600 mt-0.5 shrink-0" />
              <span><strong>No Public Scores:</strong> Other students never see numbers or character judgments.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust, Safety & Campus Identity */}
      <section className="bg-white rounded-3xl border border-[#E4E6EB] p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1746B8]" />
          <span>Trust & Campus Safety</span>
        </h3>
        <p className="text-xs text-[#666D7A] leading-relaxed">
          Because Campus 2.0 connects students meeting in-person on campus, accounts are restricted to verified MANIT institutional credentials (@manit.ac.in). Chats are plan-scoped, and harassment triggers immediate campus review.
        </p>
      </section>
    </div>
  );
};
