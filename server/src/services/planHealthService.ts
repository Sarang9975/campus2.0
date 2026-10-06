import { IPlan, PlanHealthStatus } from '../models/Plan.js';

/**
 * Plan Health Service (V1)
 *
 * Deterministic rule-based evaluation of plan viability:
 * - HIGH: All required spots committed, healthy reconfirmations, and viable bench backup
 * - WATCH: One or more unconfirmed members near deadline, thin bench, or 1 spot unfilled
 * - AT_RISK: An open slot released, zero bench backups, or past reconfirmation deadline with missing members
 */

export interface PlanHealthAssessment {
  healthStatus: PlanHealthStatus;
  healthReason: string;
  committedCount: number;
  requiredSpots: number;
  benchDepth: number;
  unconfirmedCount: number;
}

export function evaluatePlanHealth(plan: IPlan): PlanHealthAssessment {
  const committedCount = plan.members.length;
  const requiredSpots = plan.requiredSpots;
  const benchDepth = plan.bench.filter((b) => b.status === 'waiting' || b.status === 'offered').length;
  const unconfirmedCount = plan.members.filter((m) => !m.reconfirmed).length;

  if (plan.status === 'HAPPENED') {
    return {
      healthStatus: 'HIGH',
      healthReason: 'Plan completed successfully in-person.',
      committedCount,
      requiredSpots,
      benchDepth,
      unconfirmedCount: 0,
    };
  }

  // If someone dropped or spots are unfilled
  if (committedCount < requiredSpots) {
    if (benchDepth > 0) {
      return {
        healthStatus: 'AT_RISK',
        healthReason: `Slot open (${committedCount}/${requiredSpots} filled). Self-healing recovery offering to bench backups.`,
        committedCount,
        requiredSpots,
        benchDepth,
        unconfirmedCount,
      };
    } else {
      return {
        healthStatus: 'AT_RISK',
        healthReason: `Slot open (${committedCount}/${requiredSpots} filled) and bench depth is zero. Immediate recruitment needed.`,
        committedCount,
        requiredSpots,
        benchDepth,
        unconfirmedCount,
      };
    }
  }

  // Full team committed
  if (unconfirmedCount > 0) {
    if (benchDepth >= unconfirmedCount) {
      return {
        healthStatus: 'WATCH',
        healthReason: `${unconfirmedCount} awaiting reconfirmation, but protected by ${benchDepth} bench backups.`,
        committedCount,
        requiredSpots,
        benchDepth,
        unconfirmedCount,
      };
    } else {
      return {
        healthStatus: 'WATCH',
        healthReason: `${unconfirmedCount} awaiting reconfirmation with thin bench backup (${benchDepth}).`,
        committedCount,
        requiredSpots,
        benchDepth,
        unconfirmedCount,
      };
    }
  }

  // Fully confirmed and full roster
  return {
    healthStatus: 'HIGH',
    healthReason: `All ${committedCount}/${requiredSpots} spots committed and reconfirmed. ${benchDepth} backups standing by.`,
    committedCount,
    requiredSpots,
    benchDepth,
    unconfirmedCount: 0,
  };
}
