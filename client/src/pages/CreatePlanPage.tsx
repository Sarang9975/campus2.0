import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Target,
  CheckCircle2,
} from 'lucide-react';

export const CreatePlanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const initialDraft = location.state?.draft || {};

  const [step, setStep] = useState<number>(1);
  const [activity, setActivity] = useState<string>(initialDraft.activity || 'Smart India Hackathon · Prototype');
  const [category, setCategory] = useState<'competitions' | 'sports' | 'clubs' | 'creative' | 'study'>(
    'competitions'
  );
  const [role, setRole] = useState<string>(initialDraft.role || 'UI Designer');
  const [date, setDate] = useState<string>(initialDraft.date || 'Saturday · 10 Oct');
  const [startTime, setStartTime] = useState<string>(initialDraft.startTime || '10:00 AM');
  const [planLocation, setPlanLocation] = useState<string>(initialDraft.location || 'Main Block · Room 302');
  const [campusZone, setCampusZone] = useState<string>('Main Block');
  const [requiredSpots, setRequiredSpots] = useState<number>(initialDraft.requiredSpots || 1);
  const [description, setDescription] = useState<string>(
    initialDraft.description || 'Looking for someone to help prototype our disaster response workflow in Figma.'
  );
  const [loading, setLoading] = useState(false);

  const handleSubmitPlan = async () => {
    try {
      setLoading(true);
      const res = await api.createPlan({
        activity,
        category,
        role,
        date,
        startTime,
        location: planLocation,
        campusZone,
        requiredSpots: Number(requiredSpots),
        description,
      });

      navigate(`/plans/${res.plan._id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  const commonRoles = [
    'UI Designer',
    'Frontend Dev',
    'Backend Engineer',
    'Football Striker',
    'Badminton Partner',
    'Photographer',
  ];

  const campusZones = [
    'Main Block',
    'SAC Sports Complex',
    'Central Library',
    'Hostel 7-10 Quad',
    'Architecture Block',
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <span className="font-mono text-xs font-bold text-[#1746B8] uppercase tracking-wider">
          Plan Creation Flow
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Make a Plan Happen
        </h1>
        <p className="text-xs text-[#666D7A] mt-0.5">
          Campus 2.0 structures your intent into a reliable group that self-heals if someone drops.
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              step >= s ? 'bg-[#1746B8]' : 'bg-[#E4E6EB]'
            }`}
          />
        ))}
      </div>

      {/* Progressive Disclosure Card */}
      <div className="bg-white rounded-3xl border border-[#E4E6EB] p-6 sm:p-8 shadow-xs space-y-6">
        {/* STEP 1: What are you trying to do? */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="font-mono text-xs text-[#1746B8] font-bold uppercase">
                Step 1 of 4
              </span>
              <h2 className="text-lg font-bold text-[#111111]">
                What are you trying to do?
              </h2>
              <p className="text-xs text-[#666D7A]">
                Name the hackathon, match, study sprint, or activity.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Activity Name:
                </label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g. Smart India Hackathon · Finals Sprint"
                  className="w-full bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1746B8] focus:ring-1 focus:ring-[#1746B8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Category:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['competitions', 'sports', 'clubs', 'creative', 'study'] as const).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors cursor-pointer ${
                          category === cat
                            ? 'bg-[#1746B8] text-white border-[#1746B8]'
                            : 'bg-white text-[#111111] border-[#E4E6EB] hover:bg-[#FAFAF8]'
                        }`}
                      >
                        <span className="capitalize">{cat}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!activity.trim()}
                className="bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-2xs press-tactile flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#F5A623]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Who / role is needed? */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="font-mono text-xs text-[#1746B8] font-bold uppercase">
                Step 2 of 4
              </span>
              <h2 className="text-lg font-bold text-[#111111]">
                Who do you need?
              </h2>
              <p className="text-xs text-[#666D7A]">
                Specify the specific role so students can match directly.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Role / Skill Needed:
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. UI Designer (Figma)"
                  className="w-full bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1746B8] focus:ring-1 focus:ring-[#1746B8]"
                />
              </div>

              {/* Quick role suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {commonRoles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="text-[11px] font-medium bg-[#F1F2F5] hover:bg-[#E8EEFB] hover:text-[#1746B8] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + {r}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  How many spots needed:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRequiredSpots(num)}
                      className={`w-10 h-10 rounded-xl font-mono text-sm font-bold border transition-colors cursor-pointer ${
                        requiredSpots === num
                          ? 'bg-[#1746B8] text-white border-[#1746B8]'
                          : 'bg-white text-[#111111] border-[#E4E6EB] hover:bg-[#FAFAF8]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-[#666D7A] hover:text-[#111111] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!role.trim()}
                className="bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-2xs press-tactile flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 text-[#F5A623]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: When & Where */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="font-mono text-xs text-[#1746B8] font-bold uppercase">
                Step 3 of 4
              </span>
              <h2 className="text-lg font-bold text-[#111111]">
                When and Where?
              </h2>
              <p className="text-xs text-[#666D7A]">
                Time and physical location on campus are hard matching filters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Date:
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. Saturday · 10 Oct"
                  className="w-full bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1746B8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Start Time:
                </label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1746B8]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Specific Location / Room:
                </label>
                <input
                  type="text"
                  value={planLocation}
                  onChange={(e) => setPlanLocation(e.target.value)}
                  placeholder="e.g. Main Block · Room 302 (Lab 4)"
                  className="w-full bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1746B8]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#111111] block mb-1">
                  Campus Zone:
                </label>
                <select
                  value={campusZone}
                  onChange={(e) => setCampusZone(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#1746B8]"
                >
                  {campusZones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-[#666D7A] hover:text-[#111111] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                disabled={!date.trim() || !planLocation.trim()}
                className="bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-2xs press-tactile flex items-center gap-1.5 cursor-pointer"
              >
                <span>Review Plan</span>
                <ArrowRight className="w-4 h-4 text-[#F5A623]" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Final Review & Publish */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <span className="font-mono text-xs text-[#1746B8] font-bold uppercase">
                Step 4 of 4
              </span>
              <h2 className="text-lg font-bold text-[#111111]">
                Review and Publish Plan
              </h2>
              <p className="text-xs text-[#666D7A]">
                Check everything before opening spots and finding matching candidates.
              </p>
            </div>

            {/* Structured Card Summary */}
            <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#E4E6EB] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-[#1746B8]">
                  {category}
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                  Likely to happen · High
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#111111]">{activity}</h3>
                <p className="text-xs font-semibold text-[#1746B8] mt-0.5">
                  Need {requiredSpots} {role}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E4E6EB]/80 grid grid-cols-2 gap-2 text-xs text-[#666D7A]">
                <div>
                  <span className="block text-[10px] uppercase font-mono">When</span>
                  <span className="font-medium text-[#111111]">{date} · {startTime}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-mono">Where</span>
                  <span className="font-medium text-[#111111] truncate block">{planLocation}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#111111] block mb-1">
                Short Note for Candidates (Optional):
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#1746B8]"
                placeholder="What should teammates know?"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-xs font-semibold text-[#666D7A] hover:text-[#111111] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleSubmitPlan}
                disabled={loading}
                className="bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md press-tactile flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#F5A623]" />
                <span>{loading ? 'Publishing Plan...' : 'Create Plan'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
