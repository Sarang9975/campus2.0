import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Plan, User, PlanMessage } from '../types/index.js';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, ShieldCheck, Calendar, MapPin, ArrowRight } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [messages, setMessages] = useState<PlanMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPlans();
  }, [currentUser]);

  const loadUserPlans = async () => {
    try {
      setLoading(true);
      const res = await api.getPlans();
      const allPlans = res.plans || [];
      const currentUserId = currentUser?._id;

      // Plans where user is member or creator
      const memberPlans = allPlans.filter((p) => {
        const isCreator =
          typeof p.creatorId === 'object'
            ? (p.creatorId as User)._id === currentUserId
            : p.creatorId === currentUserId;
        const isMember = p.members.some((m) => {
          const uid = typeof m.userId === 'object' ? (m.userId as User)._id : m.userId;
          return uid === currentUserId;
        });
        return isCreator || isMember;
      });

      setPlans(memberPlans);
      if (memberPlans.length > 0) {
        selectPlan(memberPlans[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectPlan = async (p: Plan) => {
    setSelectedPlan(p);
    try {
      const res = await api.getMessages(p._id);
      setMessages(res.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !text.trim() || !currentUser) return;

    try {
      const res = await api.sendMessage(selectedPlan._id, text);
      setMessages((prev) => [...prev, res.message]);
      setText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
      <div>
        <span className="font-mono text-xs font-bold text-[#1746B8] uppercase tracking-wider">
          Plan-Scoped Communication
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Plan Coordination Channels
        </h1>
        <p className="text-xs text-[#666D7A] mt-0.5">
          Campus 2.0 does not support permanent stranger DMs. Conversations are strictly scoped to physical plans.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#E4E6EB] overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
        {/* Left column: Plan Channels */}
        <div className="border-r border-[#E4E6EB] p-4 space-y-3 bg-[#FAFAF8]">
          <span className="font-mono text-[11px] font-bold uppercase text-[#666D7A] block">
            Your Active Plan Groups ({plans.length})
          </span>

          {loading ? (
            <div className="space-y-2">
              <div className="h-14 bg-stone-100 rounded-xl animate-pulse" />
              <div className="h-14 bg-stone-100 rounded-xl animate-pulse" />
            </div>
          ) : plans.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#666D7A]">
              You have not joined any active plans yet.
            </div>
          ) : (
            <div className="space-y-1.5">
              {plans.map((p) => {
                const isSelected = selectedPlan?._id === p._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => selectPlan(p)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-white border-[#1746B8] shadow-xs'
                        : 'bg-white/60 hover:bg-white border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-[#1746B8]">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#666D7A]">
                        {p.members.length} members
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#111111] line-clamp-1 mt-0.5">
                      {p.activity}
                    </h4>
                    <span className="text-[11px] text-[#666D7A] block truncate mt-0.5">
                      📍 {p.location}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Selected Plan Chat */}
        <div className="md:col-span-2 flex flex-col justify-between p-4 sm:p-6 bg-white min-h-[450px]">
          {selectedPlan ? (
            <>
              {/* Header */}
              <div className="border-b border-[#E4E6EB] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#111111]">
                    {selectedPlan.activity}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#666D7A] mt-0.5">
                    <span>{selectedPlan.date} · {selectedPlan.startTime}</span>
                    <span>·</span>
                    <span>{selectedPlan.location}</span>
                  </div>
                </div>

                <Link
                  to={`/plans/${selectedPlan._id}`}
                  className="text-xs font-semibold text-[#1746B8] hover:underline flex items-center gap-1"
                >
                  <span>Plan details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Chat feed */}
              <div className="flex-1 py-4 overflow-y-auto space-y-2.5 max-h-[360px]">
                {messages.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#666D7A]">
                    No messages yet. Send an update about arrival time or materials.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSelf = m.senderId?._id === currentUser?._id;
                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${
                          m.isSystemAnnouncement
                            ? 'items-center'
                            : isSelf
                            ? 'items-end'
                            : 'items-start'
                        }`}
                      >
                        {m.isSystemAnnouncement ? (
                          <div className="bg-[#E8EEFB] text-[#1746B8] border border-[#1746B8]/20 rounded-full px-3 py-1 text-[11px] font-medium my-1">
                            {m.text}
                          </div>
                        ) : (
                          <div
                            className={`max-w-[80%] rounded-2xl p-3 text-xs space-y-0.5 ${
                              isSelf
                                ? 'bg-[#1746B8] text-white rounded-br-xs'
                                : 'bg-[#F1F2F5] text-[#111111] rounded-bl-xs'
                            }`}
                          >
                            <span
                              className={`text-[10px] font-bold block ${
                                isSelf ? 'text-white/80' : 'text-[#666D7A]'
                              }`}
                            >
                              {m.senderId?.name}
                            </span>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E4E6EB] flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type message for your team..."
                  className="flex-1 bg-[#FAFAF8] border border-[#E4E6EB] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#1746B8]"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="bg-[#1746B8] hover:bg-[#123796] text-white px-4 py-2.5 rounded-xl font-bold text-xs press-tactile transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#F5A623]" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-[#666D7A]">
              Select a plan channel to view coordination messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
