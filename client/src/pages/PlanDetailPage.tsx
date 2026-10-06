import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Plan, User, PlanMessage, MatchCandidate } from '../types/index.js';
import { PlanHealthBadge } from '../components/PlanHealthBadge.js';
import { getStatusBadge } from '../lib/utils.js';
import { SelfHealingModal } from '../components/SelfHealingModal.js';
import { GuiltFreeReleaseModal } from '../components/GuiltFreeReleaseModal.js';
import { CheckInModal } from '../components/CheckInModal.js';
import { MatchingExplainer } from '../components/MatchingExplainer.js';
import {
  Calendar,
  MapPin,
  Users,
  Armchair,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  QrCode,
  Zap,
  UserPlus,
  HeartHandshake,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const PlanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<PlanMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [matches, setMatches] = useState<MatchCandidate[]>([]);

  // Modals
  const [showSelfHealing, setShowSelfHealing] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadPlanData();
    }
  }, [id]);

  const loadPlanData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const planRes = await api.getPlanById(id);
      setPlan(planRes.plan);

      // Load plan-scoped chat
      const msgRes = await api.getMessages(id);
      setMessages(msgRes.messages || []);

      // Load matching candidates if spots are open
      if (planRes.plan.members.length < planRes.plan.requiredSpots) {
        const matchRes = await api.getMatches(id);
        setMatches(matchRes.matches || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newMessageText.trim() || !currentUser) return;

    try {
      const res = await api.sendMessage(id, newMessageText);
      setMessages((prev) => [...prev, res.message]);
      setNewMessageText('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommit = async () => {
    if (!id) return;
    try {
      const res = await api.commitSpot(id);
      setPlan(res.plan);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleJoinBench = async () => {
    if (!id) return;
    try {
      const res = await api.joinBench(id);
      setPlan(res.plan);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReconfirm = async () => {
    if (!id) return;
    try {
      const res = await api.reconfirmSpot(id);
      setPlan(res.plan);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-4">
        <div className="h-10 w-48 bg-stone-200 rounded-xl animate-pulse" />
        <div className="h-64 bg-white rounded-3xl border border-[#E4E6EB] animate-pulse" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#111111]">Plan not found</h2>
        <Link to="/" className="text-xs text-[#1746B8] font-bold">
          Return to campus home
        </Link>
      </div>
    );
  }

  const currentUserId = currentUser?._id;

  const isCommittedMember = plan.members.some((m) => {
    const uid = typeof m.userId === 'object' ? (m.userId as User)._id : m.userId;
    return uid === currentUserId;
  });

  const currentUserMemberRecord = plan.members.find((m) => {
    const uid = typeof m.userId === 'object' ? (m.userId as User)._id : m.userId;
    return uid === currentUserId;
  });

  const isOnBench = plan.bench.some((b) => {
    const uid = typeof b.userId === 'object' ? (b.userId as User)._id : b.userId;
    return uid === currentUserId && (b.status === 'waiting' || b.status === 'offered');
  });

  const hasBenchOffer = plan.bench.some((b) => {
    const uid = typeof b.userId === 'object' ? (b.userId as User)._id : b.userId;
    return uid === currentUserId && b.status === 'offered';
  });

  const statusBadge = getStatusBadge(plan.status);
  const benchMembers = plan.bench.filter((b) => b.status === 'waiting' || b.status === 'offered');
  const spotsAvailable = Math.max(0, plan.requiredSpots - plan.members.length);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Self-Healing Trigger Banner if Plan is At Risk */}
      {(plan.status === 'AT_RISK' || plan.status === 'RECOVERING' || plan.healthStatus === 'AT_RISK') && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-amber-50 to-[#FEF6E9] rounded-3xl border-2 border-rose-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono text-[11px] font-extrabold uppercase text-rose-700 tracking-wider">
                Self-Healing System Active
              </span>
              <h3 className="text-base font-bold text-[#111111]">
                {plan.healthReason}
              </h3>
              <p className="text-xs text-[#666D7A] mt-0.5">
                Campus 2.0 is actively resolving this vacancy from the Bench.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSelfHealing(true)}
            className="bg-[#1746B8] hover:bg-[#123796] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md press-tactile flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#F5A623]" />
            <span>Launch Self-Healing Workflow</span>
          </button>
        </div>
      )}

      {/* Main Plan Overview Card */}
      <section className="bg-white rounded-3xl border border-[#E4E6EB] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-[#1746B8] uppercase bg-[#E8EEFB] px-2.5 py-0.5 rounded-md">
                {plan.category}
              </span>
              <span className={`font-mono text-xs font-bold uppercase px-2.5 py-0.5 rounded-md border ${statusBadge.class}`}>
                {statusBadge.label}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight pt-1">
              {plan.activity}
            </h1>

            <div className="text-base sm:text-lg font-bold text-[#1746B8] flex items-center gap-2">
              <span>Need {plan.role}</span>
            </div>
          </div>

          {/* Health Indicator */}
          <PlanHealthBadge health={plan.healthStatus} size="lg" />
        </div>

        {/* Location & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FAFAF8] rounded-2xl border border-[#E4E6EB]/80 text-xs">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#1746B8] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-mono text-[#666D7A] block">Date & Time</span>
              <strong className="text-[#111111] font-semibold">{plan.date} · {plan.startTime}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#F5A623] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-mono text-[#666D7A] block">Location</span>
              <strong className="text-[#111111] font-semibold truncate block">{plan.location}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[#666D7A] shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-mono text-[#666D7A] block">Roster Spots</span>
              <strong className="text-[#111111] font-semibold">
                {plan.members.length} / {plan.requiredSpots} committed · {benchMembers.length} on Bench
              </strong>
            </div>
          </div>
        </div>

        {plan.description && (
          <p className="text-xs sm:text-sm text-[#666D7A] leading-relaxed">
            {plan.description}
          </p>
        )}

        {/* Action bar for user state */}
        <div className="pt-2 border-t border-[#E4E6EB] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* North star check in trigger */}
            {plan.status !== 'HAPPENED' ? (
              <button
                onClick={() => setShowCheckInModal(true)}
                className="bg-stone-900 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 press-tactile transition-colors cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Check-in (In-Person)</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>It Happened! Group Met on Campus</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* If user is committed */}
            {isCommittedMember ? (
              <div className="flex items-center gap-2">
                {currentUserMemberRecord && !currentUserMemberRecord.reconfirmed && (
                  <button
                    onClick={handleReconfirm}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl press-tactile shadow-2xs"
                  >
                    YES, I'M IN
                  </button>
                )}

                <button
                  onClick={() => setShowReleaseModal(true)}
                  className="bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold px-3 py-2 rounded-xl press-tactile transition-colors"
                >
                  Release my spot
                </button>
              </div>
            ) : (
              <>
                {/* User is not committed */}
                {spotsAvailable > 0 && (
                  <button
                    onClick={handleCommit}
                    className="bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs press-tactile"
                  >
                    I'm in ({spotsAvailable} spots open)
                  </button>
                )}

                {!isOnBench && (
                  <button
                    onClick={handleJoinBench}
                    className="bg-white hover:bg-stone-50 border border-[#E4E6EB] text-[#111111] text-xs font-semibold px-3.5 py-2 rounded-xl press-tactile flex items-center gap-1.5"
                  >
                    <Armchair className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>Join the Bench</span>
                  </button>
                )}

                {hasBenchOffer && (
                  <button
                    onClick={() => setShowSelfHealing(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl animate-bounce"
                  >
                    Accept Offered Backup Slot
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Two Column Layout: Team Roster & The Bench */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* COMMITTED TEAM ROSTER */}
        <section className="bg-white rounded-3xl border border-[#E4E6EB] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#111111]">
                Committed Roster ({plan.members.length} / {plan.requiredSpots})
              </h3>
              <p className="text-xs text-[#666D7A]">
                Students confirmed for this session.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-[#1746B8]">
              {spotsAvailable === 0 ? 'Full Roster' : `${spotsAvailable} Open`}
            </span>
          </div>

          <div className="divide-y divide-[#E4E6EB]">
            {plan.members.map((member, idx) => {
              const userObj = typeof member.userId === 'object' ? (member.userId as User) : null;
              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={userObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                      alt={userObj?.name || 'Student'}
                      className="w-9 h-9 rounded-full object-cover border border-[#1746B8]/20"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs sm:text-sm text-[#111111]">
                          {userObj?.name || 'Teammate'}
                        </span>
                        {userObj?.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#1746B8]" />}
                      </div>
                      <span className="text-[11px] text-[#666D7A] block">
                        {member.role}
                      </span>
                    </div>
                  </div>

                  <div>
                    {member.reconfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        Reconfirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {spotsAvailable > 0 && (
              <div className="py-3.5 flex items-center justify-between border-dashed border-2 border-stone-200 rounded-xl px-3 my-1 bg-stone-50/50">
                <span className="text-xs font-medium text-[#666D7A] italic">
                  + {spotsAvailable} open {plan.role} spot waiting for participant
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#E8EEFB] text-[#1746B8] px-2 py-0.5 rounded">
                  Open Slot
                </span>
              </div>
            )}
          </div>
        </section>

        {/* THE BENCH */}
        <section className="bg-white rounded-3xl border border-[#E4E6EB] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Armchair className="w-4 h-4 text-[#F5A623]" />
                <h3 className="font-bold text-base text-[#111111]">The Bench</h3>
              </div>
              <p className="text-xs text-[#666D7A]">
                Backup participants ready to step in if someone drops.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-amber-900 bg-[#FEF6E9] px-2 py-0.5 rounded">
              {benchMembers.length} backups
            </span>
          </div>

          <div className="p-3 bg-[#FEF6E9]/60 rounded-2xl border border-amber-200/70 text-xs text-amber-900 space-y-1">
            <p className="font-semibold">
              The Bench is not a waitlist.
            </p>
            <p className="text-[11px] opacity-90">
              Bench members guarantee plan viability. If someone has to release early, the highest-reliability backup receives first notice to keep the plan alive.
            </p>
          </div>

          <div className="divide-y divide-[#E4E6EB]">
            {benchMembers.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#666D7A]">
                Your Bench is quiet. That's okay — we'll notify students when a plan needs them.
              </div>
            ) : (
              benchMembers.map((benchEntry, idx) => {
                const userObj = typeof benchEntry.userId === 'object' ? (benchEntry.userId as User) : null;
                return (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={userObj?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80'}
                        alt={userObj?.name || 'Student'}
                        className="w-9 h-9 rounded-full object-cover border border-[#F5A623]/30"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#111111]">
                            {userObj?.name || 'Backup'}
                          </span>
                          {userObj?.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#1746B8]" />}
                        </div>
                        <span className="text-[11px] text-[#666D7A]">
                          Priority #{idx + 1} backup · {benchEntry.role}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] uppercase font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded">
                      {benchEntry.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Transparent Matching Explainer if spots are open */}
      {spotsAvailable > 0 && (
        <section className="bg-white rounded-3xl border border-[#E4E6EB] p-5 sm:p-6">
          <MatchingExplainer matches={matches} />
        </section>
      )}

      {/* PLAN-SCOPED MESSAGES */}
      <section className="bg-white rounded-3xl border border-[#E4E6EB] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E4E6EB] pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1746B8]" />
            <h3 className="font-bold text-base text-[#111111]">
              Plan Coordination Chat
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#666D7A]">
            Archived when plan concludes · No stranger DMs
          </span>
        </div>

        {/* Message log */}
        <div className="max-h-72 overflow-y-auto space-y-2.5 p-2 bg-[#FAFAF8] rounded-2xl border border-[#E4E6EB]/80">
          {messages.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#666D7A]">
              No coordination messages yet. Use this space for room clarification, tools, and arrival times.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-2xl text-xs space-y-1 ${
                  msg.isSystemAnnouncement
                    ? 'bg-[#E8EEFB] border border-[#1746B8]/20 text-[#1746B8]'
                    : 'bg-white border border-[#E4E6EB] text-[#111111]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <strong className="font-semibold text-[#111111]">
                    {msg.senderId?.name || 'System Announcement'}
                  </strong>
                  <span className="text-[#666D7A] font-mono text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="Coordinate venue, materials, or arrival..."
            className="flex-1 bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#1746B8]"
          />
          <button
            type="submit"
            disabled={!newMessageText.trim()}
            className="bg-[#1746B8] hover:bg-[#123796] text-white px-4 py-2.5 rounded-xl font-bold text-xs press-tactile transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </section>

      {/* MODALS */}
      <SelfHealingModal
        plan={plan}
        isOpen={showSelfHealing}
        onClose={() => setShowSelfHealing(false)}
        onPlanRestored={(updated) => {
          setPlan(updated);
          setShowSelfHealing(false);
          loadPlanData();
        }}
      />

      <GuiltFreeReleaseModal
        plan={plan}
        isOpen={showReleaseModal}
        onClose={() => setShowReleaseModal(false)}
        onReleased={(updated) => {
          setPlan(updated);
          setShowReleaseModal(false);
          loadPlanData();
        }}
      />

      <CheckInModal
        plan={plan}
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onCheckInCompleted={(updated) => {
          setPlan(updated);
          loadPlanData();
        }}
      />
    </div>
  );
};
