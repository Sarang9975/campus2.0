import React from 'react';
import { getHealthDisplay } from '../lib/utils.js';

interface Props {
  health: string;
  size?: 'sm' | 'md' | 'lg';
  showSub?: boolean;
}

export const PlanHealthBadge: React.FC<Props> = ({ health, size = 'md', showSub = true }) => {
  const info = getHealthDisplay(health);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-medium',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono tracking-tight transition-colors ${info.badgeClass} ${sizeClasses}`}
    >
      <span className={`h-2 w-2 rounded-full ${info.dotClass} animate-pulse`} />
      <span className="font-semibold uppercase tracking-wider">{info.label}</span>
      {showSub && (
        <span className="hidden sm:inline opacity-75 font-normal">
          · {info.sub}
        </span>
      )}
    </div>
  );
};
