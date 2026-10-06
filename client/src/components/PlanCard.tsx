import React from 'react';
import { Link } from 'react-router-dom';
import { Plan, User } from '../types/index.js';
import { PlanHealthBadge } from './PlanHealthBadge.js';
import { getStatusBadge } from '../lib/utils.js';
import { Calendar, MapPin, Users, Armchair, ArrowRight, Check } from 'lucide-react';

interface Props {
  plan: Plan;
  onJoin?: (planId: string) => void;
  onJoinBench?: (planId: string) => void;
  currentUserId?: string;
}

export const PlanCard: React.FC<Props> = ({ plan, onJoin, onJoinBench, currentUserId }) => {
  const isCreator =
    typeof plan.creatorId === 'object'
      ? (plan.creatorId as User)._id === currentUserId
      : plan.creatorId === currentUserId;

  const isCommitted = plan.members.some((m) => {
    const uid = typeof m.userId === 'object' ? (m.userId as User)._id : m.userId;
    return uid === currentUserId;
  });

  const isOnBench = plan.bench.some((b) => {
    const uid = typeof b.userId === 'object' ? (b.userId as User)._id : b.userId;
    return uid === currentUserId;
  });

  const committedCount = plan.members.length;
  const spotsAvailable = Math.max(0, plan.requiredSpots - committedCount);
  const benchCount = plan.bench.filter((b) => b.status === 'waiting' || b.status === 'offered').length;
  const statusInfo = getStatusBadge(plan.status);

  const categoryBadgeColors = {
    competitions: 'bg-amber-50 text-amber-900 border-amber-200',
    sports: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    clubs: 'bg-blue-50 text-blue-900 border-blue-200',
    creative: 'bg-purple-50 text-purple-900 border-purple-200',
    study: 'bg-stone-100 text-stone-800 border-stone-200',
  }[plan.category] || 'bg-stone-100 text-stone-800 border-stone-200';

  return (
    <div className="bg-white rounded-2xl border border-[#E4E6EB] hover:border-[#1746B8]/40 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden group">
      {/* Top Banner */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border ${categoryBadgeColors}`}
            >
              {plan.category}
            </span>
            <span
              className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded-md font-semibold border ${statusInfo.class}`}
            >
              {statusInfo.label}
            </span>
          </div>

          <PlanHealthBadge health={plan.healthStatus} size="sm" showSub={false} />
        </div>

        {/* Activity & Role Needed */}
        <Link to={`/plans/${plan._id}`} className="block group-hover:text-[#1746B8] transition-colors">
          <h3 className="text-base sm:text-lg font-bold text-[#111111] line-clamp-1 leading-snug">
            {plan.activity}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#1746B8]">
            <span>Need {plan.role}</span>
          </div>
        </Link>

        {/* Location & Time Chips */}
        <div className="mt-3.5 space-y-1.5 text-xs text-[#666D7A]">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#1746B8] shrink-0" />
            <span className="font-medium text-[#111111]">{plan.date}</span>
            <span>·</span>
            <span>{plan.startTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
            <span className="truncate">{plan.location}</span>
          </div>
        </div>

        {/* Spots & Bench Progress */}
        <div className="mt-4 pt-3.5 border-t border-[#E4E6EB]/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#666D7A]" />
            <span className="font-semibold text-[#111111] font-mono">
              {committedCount} / {plan.requiredSpots}
            </span>
            <span className="text-[#666D7A]">committed</span>
          </div>

          {benchCount > 0 ? (
            <div className="flex items-center gap-1 text-[#F5A623] bg-[#FEF6E9] px-2 py-0.5 rounded font-mono text-[11px] font-semibold">
              <Armchair className="w-3 h-3" />
              <span>{benchCount} on Bench</span>
            </div>
          ) : (
            <span className="text-[11px] text-[#666D7A]">Bench open</span>
          )}
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="bg-[#F1F2F5]/60 px-4 py-3 border-t border-[#E4E6EB] flex items-center justify-between gap-2">
        <Link
          to={`/plans/${plan._id}`}
          className="text-xs font-semibold text-[#1746B8] hover:text-[#123796] flex items-center gap-1"
        >
          <span>View Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {isCommitted ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
            <Check className="w-3.5 h-3.5" />
            <span>You're in</span>
          </span>
        ) : isOnBench ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg">
            <Armchair className="w-3.5 h-3.5" />
            <span>On Bench</span>
          </span>
        ) : spotsAvailable > 0 && onJoin ? (
          <button
            onClick={() => onJoin(plan._id)}
            className="bg-[#1746B8] hover:bg-[#123796] text-white text-xs font-bold px-3 py-1.5 rounded-lg press-tactile transition-all shadow-2xs"
          >
            I'm in
          </button>
        ) : onJoinBench ? (
          <button
            onClick={() => onJoinBench(plan._id)}
            className="bg-white hover:bg-stone-50 border border-[#E4E6EB] text-[#111111] text-xs font-semibold px-2.5 py-1.5 rounded-lg press-tactile transition-all"
          >
            Join Bench
          </button>
        ) : (
          <Link
            to={`/plans/${plan._id}`}
            className="bg-white hover:bg-stone-50 border border-[#E4E6EB] text-[#111111] text-xs font-semibold px-2.5 py-1.5 rounded-lg"
          >
            Details
          </Link>
        )}
      </div>
    </div>
  );
};
