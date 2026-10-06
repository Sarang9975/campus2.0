import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  } catch {
    return '';
  }
}

export function getHealthDisplay(health: string) {
  switch (health) {
    case 'HIGH':
      return {
        label: 'LIKELY TO HAPPEN',
        sub: 'HIGH CONFIDENCE',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500',
      };
    case 'WATCH':
      return {
        label: 'WATCHING THE PLAN',
        sub: 'NEEDS CONFIRMATION',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotClass: 'bg-amber-500',
      };
    case 'AT_RISK':
    default:
      return {
        label: 'PLAN AT RISK',
        sub: 'RECOVERY ACTIVE',
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
        dotClass: 'bg-rose-500',
      };
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return { label: 'CONFIRMED', class: 'bg-[#1746B8]/10 text-[#1746B8] border-[#1746B8]/20' };
    case 'AT_RISK':
      return { label: 'AT RISK', class: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'RECOVERING':
      return { label: 'RECOVERING', class: 'bg-amber-100 text-amber-900 border-amber-300' };
    case 'HAPPENED':
      return { label: 'IT HAPPENED', class: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'REPEAT':
      return { label: 'REPEAT CREW', class: 'bg-purple-100 text-purple-800 border-purple-300' };
    case 'FILLING':
      return { label: 'FILLING', class: 'bg-blue-50 text-blue-700 border-blue-200' };
    default:
      return { label: 'MATCHING', class: 'bg-stone-100 text-stone-700 border-stone-200' };
  }
}
