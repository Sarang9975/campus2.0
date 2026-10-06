import React from 'react';
import { MatchCandidate } from '../types/index.js';
import { Check, ShieldCheck, UserPlus, Flame } from 'lucide-react';

interface Props {
  matches: MatchCandidate[];
  onInvite?: (candidateUserId: string) => void;
}

export const MatchingExplainer: React.FC<Props> = ({ matches, onInvite }) => {
  if (matches.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-[#E4E6EB] text-center text-xs text-[#666D7A]">
        No eligible campus candidates found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#111111]">Explainable Campus Matches</h4>
          <p className="text-[11px] text-[#666D7A]">
            Rule-based matching: Hard filters on Role + Time; ranked by proximity and track record.
          </p>
        </div>
        <span className="font-mono text-[10px] bg-stone-100 text-[#111111] font-bold px-2 py-0.5 rounded border border-stone-200 uppercase">
          V1 Deterministic
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {matches.map((item) => (
          <div
            key={item.user._id}
            className="p-4 bg-white rounded-2xl border border-[#E4E6EB] hover:border-[#1746B8]/40 transition-colors shadow-2xs space-y-3"
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#1746B8]/20"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#111111]">{item.user.name}</span>
                    {item.user.verified && <ShieldCheck className="w-3.5 h-3.5 text-[#1746B8]" />}
                  </div>
                  <span className="text-[11px] text-[#666D7A] block">
                    {item.user.branch} · {item.user.year}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono font-bold bg-[#E8EEFB] text-[#1746B8] px-2 py-0.5 rounded-full uppercase">
                {item.summaryHeadline}
              </span>
            </div>

            {/* Matched Factors */}
            <div className="bg-[#FAFAF8] p-2.5 rounded-xl border border-[#E4E6EB]/60 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#666D7A] block">
                Matched because:
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {item.matchedFactors.map((factor, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-1.5 text-xs text-[#111111]">
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                        factor.matched ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-500'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                    <span className="truncate text-[11px] font-medium">{factor.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proximity & Roles */}
            <div className="flex items-center justify-between text-[11px] text-[#666D7A]">
              <span>📍 {item.user.campusZone}</span>
              {onInvite && (
                <button
                  onClick={() => onInvite(item.user._id)}
                  className="text-xs font-bold text-[#1746B8] hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Invite to Plan</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
