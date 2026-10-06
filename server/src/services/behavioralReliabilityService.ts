import { ParticipationEvent } from '../models/ParticipationEvent.js';
import mongoose from 'mongoose';

/**
 * Behavioral Reliability Service (V1)
 *
 * NOTE: V1 uses purely deterministic, transparent heuristic rules - NOT machine learning.
 * Strategic intent:
 * - Early releases are NEVER penalized (encourages early signal rather than ghosting)
 * - Attended activities and bench step-ins boost backup priority
 * - No-shows and late cancellations lower priority for future backup offers
 * - Data remains strictly PRIVATE to the student, never exposed as a public score.
 */

export interface CandidateReliabilityScore {
  userId: string;
  score: number;
  completedCount: number;
  benchStepInCount: number;
  earlyReleaseCount: number;
  lateReleaseCount: number;
  noShowCount: number;
  reasons: string[];
}

export async function calculateCandidateReliability(
  userId: mongoose.Types.ObjectId | string
): Promise<CandidateReliabilityScore> {
  const events = await ParticipationEvent.find({ userId }).sort({ timestamp: -1 });

  let score = 10; // Baseline neutral backup priority
  let completedCount = 0;
  let benchStepInCount = 0;
  let earlyReleaseCount = 0;
  let lateReleaseCount = 0;
  let noShowCount = 0;
  const reasons: string[] = [];

  for (const event of events) {
    switch (event.eventType) {
      case 'CHECK_IN':
      case 'COMPLETED':
        completedCount++;
        score += 1;
        break;
      case 'BENCH_ACCEPT':
        benchStepInCount++;
        score += 2;
        break;
      case 'EARLY_RELEASE':
        earlyReleaseCount++;
        // Explicit design decision: zero penalty for notifying team early
        break;
      case 'LATE_RELEASE':
        lateReleaseCount++;
        score -= 2;
        break;
      case 'NO_SHOW':
        noShowCount++;
        score -= 4;
        break;
    }
  }

  if (completedCount > 2) {
    reasons.push(`${completedCount} completed sessions with strong follow-through`);
  }
  if (benchStepInCount > 0) {
    reasons.push(`Stepped in as a reliable bench backup ${benchStepInCount} time(s)`);
  }
  if (earlyReleaseCount > 0) {
    reasons.push('Courteous early release notice recorded (zero penalty)');
  }
  if (lateReleaseCount > 0) {
    reasons.push(`${lateReleaseCount} late release(s) impacted backup priority`);
  }
  if (reasons.length === 0) {
    reasons.push('Clean new participant standing');
  }

  return {
    userId: userId.toString(),
    score,
    completedCount,
    benchStepInCount,
    earlyReleaseCount,
    lateReleaseCount,
    noShowCount,
    reasons,
  };
}
