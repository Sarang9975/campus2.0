import { Plan, IPlan } from '../models/Plan.js';
import { User, IUser } from '../models/User.js';
import { ParticipationEvent } from '../models/ParticipationEvent.js';
import { Notification } from '../models/Notification.js';
import { Message } from '../models/Message.js';
import { calculateCandidateReliability } from './behavioralReliabilityService.js';
import { evaluatePlanHealth } from './planHealthService.js';
import mongoose from 'mongoose';

export interface RecoveryBackupCandidate {
  userId: string;
  name: string;
  branch: string;
  year: string;
  avatar: string;
  campusZone: string;
  reliabilityScore: number;
  fitReasons: string[];
  benchJoinedAt: Date;
}

export interface RecoveryStatusResult {
  planId: string;
  status: string;
  healthStatus: string;
  openSpots: number;
  droppedMemberName?: string;
  eligibleBackups: RecoveryBackupCandidate[];
  currentlyOffered?: RecoveryBackupCandidate | null;
  message: string;
}

/**
 * Inspects an at-risk plan and identifies the best eligible bench candidate using deterministic rules.
 */
export async function inspectPlanRecovery(planId: string): Promise<RecoveryStatusResult> {
  const plan = await Plan.findById(planId).populate('bench.userId', 'name branch year avatar campusZone roles');
  if (!plan) throw new Error('Plan not found');

  const openSpots = Math.max(0, plan.requiredSpots - plan.members.length);
  const healthAssessment = evaluatePlanHealth(plan);

  // Inspect Bench candidates
  const eligibleBackups: RecoveryBackupCandidate[] = [];
  let currentlyOffered: RecoveryBackupCandidate | null = null;

  for (const b of plan.bench) {
    if (b.status === 'declined' || b.status === 'expired') continue;

    const userDoc = b.userId as any as IUser;
    if (!userDoc || !userDoc._id) continue;

    const rel = await calculateCandidateReliability(userDoc._id);
    const fitReasons = [
      `Role alignment: ${plan.role}`,
      `Available for scheduled time (${plan.date} · ${plan.startTime})`,
      `Campus proximity: ${userDoc.campusZone || 'Main Block'}`,
      ...rel.reasons.slice(0, 2),
    ];

    const candidate: RecoveryBackupCandidate = {
      userId: userDoc._id.toString(),
      name: userDoc.name,
      branch: userDoc.branch,
      year: userDoc.year,
      avatar: userDoc.avatar,
      campusZone: userDoc.campusZone,
      reliabilityScore: rel.score,
      fitReasons,
      benchJoinedAt: b.joinedAt,
    };

    if (b.status === 'offered') {
      currentlyOffered = candidate;
    }
    eligibleBackups.push(candidate);
  }

  // Sort eligible candidates by highest reliability score, then earliest bench join
  eligibleBackups.sort((a, b) => {
    if (b.reliabilityScore !== a.reliabilityScore) {
      return b.reliabilityScore - a.reliabilityScore;
    }
    return new Date(a.benchJoinedAt).getTime() - new Date(b.benchJoinedAt).getTime();
  });

  return {
    planId: plan._id.toString(),
    status: plan.status,
    healthStatus: healthAssessment.healthStatus,
    openSpots,
    eligibleBackups,
    currentlyOffered,
    message:
      openSpots > 0
        ? `${openSpots} slot(s) open. ${eligibleBackups.length} verified candidate(s) ready on the Bench.`
        : 'Roster is full.',
  };
}

/**
 * Triggers an official slot offer to the top ranked bench candidate.
 */
export async function triggerSlotOffer(planId: string, candidateUserId?: string): Promise<{ plan: IPlan; offeredCandidate: any }> {
  const plan = await Plan.findById(planId);
  if (!plan) throw new Error('Plan not found');

  // If no specific candidate provided, find the highest ranked waiting bench member
  let targetIndex = -1;
  if (candidateUserId) {
    targetIndex = plan.bench.findIndex(
      (b) => b.userId.toString() === candidateUserId && b.status !== 'declined'
    );
  } else {
    targetIndex = plan.bench.findIndex((b) => b.status === 'waiting');
  }

  if (targetIndex === -1) {
    throw new Error('No eligible bench candidates available for recovery offer');
  }

  const benchEntry = plan.bench[targetIndex];
  benchEntry.status = 'offered';
  benchEntry.offeredAt = new Date();
  plan.status = 'RECOVERING';
  plan.healthStatus = 'AT_RISK';
  plan.healthReason = 'Slot offered to backup candidate. Awaiting acceptance.';

  await plan.save();

  // Create audit event
  await ParticipationEvent.create({
    userId: benchEntry.userId,
    planId: plan._id,
    eventType: 'BENCH_OFFER',
    metadata: { role: plan.role },
  });

  // Create targeted notification for the bench candidate
  await Notification.create({
    userId: benchEntry.userId,
    type: 'BENCH_OFFER',
    planId: plan._id,
    title: `⚡ Bench Offer: ${plan.activity}`,
    message: `A slot just opened for "${plan.role}" on ${plan.date} at ${plan.startTime}. Would you like to step in?`,
    actionUrl: `/plans/${plan._id}`,
  });

  // Add system message in plan chat
  const candidateUser = await User.findById(benchEntry.userId);
  await Message.create({
    planId: plan._id,
    senderId: plan.creatorId,
    text: `⚡ Self-Healing System: Offered open slot to backup ${candidateUser?.name || 'student'}. Plan is actively recovering.`,
    isSystemAnnouncement: true,
  });

  return { plan, offeredCandidate: candidateUser };
}

/**
 * Accepts the offered bench slot and restores the plan to CONFIRMED / HEALTHY!
 */
export async function acceptBenchOffer(planId: string, candidateUserId: string): Promise<IPlan> {
  const plan = await Plan.findById(planId);
  if (!plan) throw new Error('Plan not found');

  const benchIndex = plan.bench.findIndex(
    (b) => b.userId.toString() === candidateUserId && (b.status === 'offered' || b.status === 'waiting')
  );
  if (benchIndex === -1) {
    throw new Error('No active bench offer found for this user');
  }

  // Remove or update bench entry
  plan.bench[benchIndex].status = 'accepted';

  // Add into committed members
  const alreadyMember = plan.members.some((m) => m.userId.toString() === candidateUserId);
  if (!alreadyMember) {
    plan.members.push({
      userId: new mongoose.Types.ObjectId(candidateUserId),
      role: plan.role,
      committedAt: new Date(),
      reconfirmed: true,
      reconfirmedAt: new Date(),
    });
  }

  // Re-evaluate health and status
  const assessment = evaluatePlanHealth(plan);
  plan.status = plan.members.length >= plan.requiredSpots ? 'CONFIRMED' : 'FILLING';
  plan.healthStatus = assessment.healthStatus;
  plan.healthReason = `Plan restored! Backup stepped in to complete the roster (${plan.members.length}/${plan.requiredSpots} committed).`;

  await plan.save();

  // Audit event
  await ParticipationEvent.create({
    userId: new mongoose.Types.ObjectId(candidateUserId),
    planId: plan._id,
    eventType: 'BENCH_ACCEPT',
    metadata: { role: plan.role },
  });

  // Notify creator and team
  const backupUser = await User.findById(candidateUserId);
  await Notification.create({
    userId: plan.creatorId,
    type: 'PLAN_RECOVERED',
    planId: plan._id,
    title: '✅ Plan Restored!',
    message: `${backupUser?.name || 'A backup'} accepted the spot. Roster is back to ${plan.members.length}/${plan.requiredSpots} committed.`,
    actionUrl: `/plans/${plan._id}`,
  });

  // System chat announcement
  await Message.create({
    planId: plan._id,
    senderId: new mongoose.Types.ObjectId(candidateUserId),
    text: `🎉 Self-Healing Success: ${backupUser?.name || 'A backup'} joined the team. Plan is restored and confirmed!`,
    isSystemAnnouncement: true,
  });

  return plan;
}
