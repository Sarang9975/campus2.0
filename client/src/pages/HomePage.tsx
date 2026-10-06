import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Plan } from '../types/index.js';
import { PlanCard } from '../components/PlanCard.js';
import {
  Sparkles,
  ArrowRight,
  Plus,
  Compass,
  Calendar,
  MapPin,
  Users,
  Shield,
  HeartHandshake,
  CheckCircle,
  Repeat,
  Flame,
  Zap,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickInput, setQuickInput] = useState('');
  const [quickDraft, setQuickDraft] = useState<{
    activity: string;
    role: string;
    date: string;
    startTime: string;
    location: string;
    requiredSpots: number;
  } | null>(null);

  useEffect(() => {
    loadNearbyPlans();
  }, []);

  const loadNearbyPlans = async () => {
    try {
      setLoading(true);
      const res = await api.getPlans();
      setPlans(res.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Structured parser for quick input
  const handleParseDraft = (text: string) => {
    setQuickInput(text);
    if (!text.trim()) {
      setQuickDraft(null);
      return;
    }

    const lower = text.toLowerCase();
    let role = 'Collaborator';
    let activity = 'Campus Activity';
    let date = 'Saturday · 10 Oct';
    let startTime = '10:00 AM';
    let location = 'Main Block · Room 302';
    let requiredSpots = 1;

    if (lower.includes('ui') || lower.includes('designer') || lower.includes('figma')) {
      role = 'UI Designer';
      activity = 'Hackathon Prototype Sprint';
    } else if (lower.includes('football') || lower.includes('striker')) {
      role = 'Football Striker';
      activity = '5-a-Side Turf Match';
      location = 'SAC Turf Ground';
      startTime = '05:30 PM';
    } else if (lower.includes('badminton')) {
      role = 'Badminton Doubles Partner';
      activity = 'Badminton Match';
      location = 'Indoor Badminton Hall';
      startTime = '07:00 AM';
    } else if (lower.includes('backend') || lower.includes('dev')) {
      role = 'Backend Engineer';
      activity = 'Smart India Hackathon';
    }

    if (lower.includes('sunday')) date = 'Sunday · 11 Oct';
    if (lower.includes('friday')) date = 'Friday · 09 Oct';
    if (lower.includes('sac')) location = 'SAC Sports Complex';
    if (lower.includes('library')) location = 'Central Library';

    setQuickDraft({
      activity,
      role,
      date,
      startTime,
      location,
      requiredSpots,
    });
  };

  const handleLaunchDraft = () => {
    if (!quickDraft) return;
    navigate('/create', { state: { draft: quickDraft } });
  };

  const sampleSuggestions = [
    'I need a UI designer for Saturday at Main Block',
    'Need 2 players for football Friday evening at SAC',
    'Badminton partner for Saturday morning at Indoor Hall',
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Product Thesis Hero Banner */}
      <section className="bg-white border-b border-[#E4E6EB] py-8 sm:py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EEFB] text-[#1746B8] font-mono text-xs font-bold tracking-tight">
              <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
              PRODUCT VERSE 2026 · PRODCON MANIT
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight leading-[1.1]">
              People say yes. <br className="hidden sm:inline" />
              <span className="text-[#1746B8]">Plans still fall apart.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#666D7A] font-medium leading-relaxed max-w-2xl">
              Campus 2.0 owns the plan until it happens. Find the missing teammate, verify availability, and automatically heal the roster if someone drops.
            </p>

            {/* Core Loop Ticker */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-[#111111] font-semibold bg-[#FAFAF8] p-2.5 rounded-xl border border-[#E4E6EB]">
              <span className="text-[#1746B8]">INTENT</span>
              <span className="text-[#666D7A]">→</span>
              <span>MATCH</span>
              <span className="text-[#666D7A]">→</span>
              <span>COMMIT</span>
              <span className="text-[#666D7A]">→</span>
              <span>RECONFIRM</span>
              <span className="text-[#666D7A]">→</span>
              <span className="text-amber-800 bg-[#FEF6E9] px-1.5 py-0.5 rounded">SELF-HEAL</span>
              <span className="text-[#666D7A]">→</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">MEET</span>
              <span className="text-[#666D7A]">→</span>
              <span>REPEAT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Top Student Intent Box: "What are you trying to make happen?" */}
        <section className="bg-white rounded-3xl border border-[#E4E6EB] p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-mono font-bold text-[#666D7A] uppercase tracking-wider">
                Good morning, {currentUser ? currentUser.name.split(' ')[0] : 'Student'}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight mt-0.5">
                What are you trying to make happen?
              </h2>
            </div>

            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 bg-[#1746B8] hover:bg-[#123796] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-2xs press-tactile transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F5A623]" />
              <span>Full Plan Form</span>
            </Link>
          </div>

          {/* Quick Input Bar */}
          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={quickInput}
                onChange={(e) => handleParseDraft(e.target.value)}
                placeholder='e.g. "I need a UI designer for Saturday at Main Block"'
                className="w-full bg-[#FAFAF8] border border-[#E4E6EB] rounded-2xl px-4 py-3.5 text-sm sm:text-base font-medium text-[#111111] placeholder:text-[#666D7A] focus:outline-none focus:border-[#1746B8] focus:ring-2 focus:ring-[#1746B8]/15 pr-28 transition-all"
              />
              {quickDraft && (
                <button
                  onClick={handleLaunchDraft}
                  className="absolute right-2 top-2 bottom-2 bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-3.5 rounded-xl press-tactile transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Create</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F5A623]" />
                </button>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[#666D7A] font-medium text-[11px]">Quick try:</span>
              {sampleSuggestions.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => handleParseDraft(text)}
                  className="text-left text-[11px] font-medium bg-[#F1F2F5] hover:bg-[#E8EEFB] hover:text-[#1746B8] text-[#111111] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  "{text}"
                </button>
              ))}
            </div>
          </div>

          {/* Structured Draft Preview Panel */}
          {quickDraft && (
            <div className="p-4 bg-[#FAFAF8] rounded-2xl border border-[#1746B8]/30 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#1746B8] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                  Structured Plan Draft
                </span>
                <span className="text-xs text-[#666D7A]">Parsed automatically</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-[#E4E6EB]">
                  <span className="text-[#666D7A] block text-[10px] uppercase font-mono">Need Role:</span>
                  <strong className="text-[#111111] font-semibold">{quickDraft.role}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E4E6EB]">
                  <span className="text-[#666D7A] block text-[10px] uppercase font-mono">When:</span>
                  <strong className="text-[#111111] font-semibold">{quickDraft.date} · {quickDraft.startTime}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E4E6EB]">
                  <span className="text-[#666D7A] block text-[10px] uppercase font-mono">Where:</span>
                  <strong className="text-[#111111] font-semibold truncate block">{quickDraft.location}</strong>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#E4E6EB]">
                  <span className="text-[#666D7A] block text-[10px] uppercase font-mono">Spots Needed:</span>
                  <strong className="text-[#111111] font-semibold">{quickDraft.requiredSpots} spot</strong>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleLaunchDraft}
                  className="bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm press-tactile cursor-pointer"
                >
                  <span>Review & Publish Plan</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F5A623]" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Competition Wedge & Sports Retention Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-gradient-to-br from-[#1746B8]/5 to-transparent rounded-3xl border border-[#1746B8]/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase text-[#1746B8] bg-[#E8EEFB] px-2.5 py-0.5 rounded-full">
                  Acquisition Wedge
                </span>
                <Flame className="w-4 h-4 text-[#F5A623]" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">
                Competitions & Hackathons
              </h3>
              <p className="text-xs text-[#666D7A] mt-1 leading-relaxed">
                High urgency students entering national hackathons with a deadline inside 7 days. Need 1 specific role (UI Designer, ML Dev) to submit on time.
              </p>
            </div>
            <Link
              to="/discover?category=competitions"
              className="mt-4 text-xs font-bold text-[#1746B8] flex items-center gap-1 hover:underline"
            >
              <span>Explore Competition Teams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  Retention Engine
                </span>
                <Repeat className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">
                Sports & Weekly Turf
              </h3>
              <p className="text-xs text-[#666D7A] mt-1 leading-relaxed">
                5-a-side football, badminton doubles, and running groups. The repeat coordination mechanic creates habitual weekly campus engagement.
              </p>
            </div>
            <Link
              to="/discover?category=sports"
              className="mt-4 text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
            >
              <span>Explore Sports & Turf Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Plans Near You Feed */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
                Plans Near You
              </h2>
              <p className="text-xs text-[#666D7A]">
                Live campus coordination across MANIT Main Block, SAC Turf, and Hostels.
              </p>
            </div>
            <Link
              to="/discover"
              className="text-xs font-bold text-[#1746B8] hover:underline flex items-center gap-1"
            >
              <span>See all plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="p-10 bg-white rounded-3xl border border-[#E4E6EB] text-center space-y-3">
              <Compass className="w-10 h-10 text-[#666D7A] mx-auto opacity-40" />
              <h3 className="text-base font-bold text-[#111111]">
                No plans yet. Be the person who starts one.
              </h3>
              <p className="text-xs text-[#666D7A] max-w-sm mx-auto">
                Got a hackathon, football game, or creative walk you want to pull off? Put it out there.
              </p>
              <Link
                to="/create"
                className="inline-block bg-[#1746B8] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Create a Plan
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  currentUserId={currentUser?._id}
                  onJoin={async (id) => {
                    await api.commitSpot(id);
                    loadNearbyPlans();
                  }}
                  onJoinBench={async (id) => {
                    await api.joinBench(id);
                    loadNearbyPlans();
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
