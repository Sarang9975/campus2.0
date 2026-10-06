import { Request, Response } from 'express';
import { Plan, IPlan } from '../models/Plan.js';
import { User } from '../models/User.js';
import { ParticipationEvent } from '../models/ParticipationEvent.js';
import { Notification } from '../models/Notification.js';
import { Message } from '../models/Message.js';
import { evaluatePlanHealth } from '../services/planHealthService.js';
import { inspectPlanRecovery, triggerSlotOffer, acceptBenchOffer } from '../services/recoveryService.js';
import { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

export async function getPlans(req: Request, res: Response): Promise<void> {
  try {
    const { category, search, filter, status } = req.query;
    const query: any = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const s = String(search).trim();
      query.$or = [
        { activity: { $regex: s, $options: 'i' } },
        { role: { $regex: s, $options: 'i' } },
        { location: { $regex: s, $options: 'i' } },
        { description: { $regex: s, $options: 'i' } },
      ];
    }

    // Additional filters (e.g. today, this week, nearby)
    if (filter === 'today') {
      query.date = { $regex: 'Today|Sat|Sun', $options: 'i' };
    }

    const plans = await Plan.find(query)
      .populate('creatorId', 'name avatar branch year campusZone verified')
      .populate('members.userId', 'name avatar branch year')
      .populate('bench.userId', 'name avatar branch year')
      .sort({ createdAt: -1 });

    res.json({ plans });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching plans' });
  }
}

export async function getPlanById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id)
      .populate('creatorId', 'name avatar branch year campusZone verified')
      .populate('members.userId', 'name avatar branch year roles campusZone verified')
      .populate('bench.userId', 'name avatar branch year roles campusZone verified')
      .populate('checkIns.userId', 'name avatar branch year');

    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Recalculate health
    const health = evaluatePlanHealth(plan);
    plan.healthStatus = health.healthStatus;
    plan.healthReason = health.healthReason;

    res.json({ plan, healthAssessment: health });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching plan' });
  }
}

export async function createPlan(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.creatorId;
    if (!userId) {
      res.status(401).json({ error: 'User must be authenticated' });
      return;
    }

    const {
      activity,
      role,
      date,
      startTime,
      endTime,
      location,
      campusZone,
      requiredSpots,
      category,
      description,
    } = req.body;

    if (!activity || !role || !date || !startTime || !location) {
      res.status(400).json({ error: 'Missing required plan details' });
      return;
    }

    // Deadline default: 2 hours prior to scheduled start or next day
    const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const plan = await Plan.create({
      creatorId: new mongoose.Types.ObjectId(userId),
      activity,
      role,
      category: category || 'competitions',
      date,
      startTime,
      endTime: endTime || '',
      location,
      campusZone: campusZone || 'Main Block',
      requiredSpots: Number(requiredSpots) || 1,
      description: description || `Looking for ${role} for ${activity}.`,
      members: [
        {
          userId: new mongoose.Types.ObjectId(userId),
          role: 'Creator / Coordinator',
          committedAt: new Date(),
          reconfirmed: true,
          reconfirmedAt: new Date(),
        },
      ],
      bench: [],
      status: 'MATCHING',
      healthStatus: 'HIGH',
      healthReason: 'Plan draft created. Ready to match qualified students.',
      reconfirmationDeadline: deadline,
      checkInCode: Math.floor(1000 + Math.random() * 9000).toString(),
      checkIns: [],
    });

    await ParticipationEvent.create({
      userId: new mongoose.Types.ObjectId(userId),
      planId: plan._id,
      eventType: 'JOIN',
      metadata: { role: 'Creator' },
    });

    // Populate and return
    const populated = await Plan.findById(plan._id).populate('creatorId', 'name avatar branch year');
    res.status(201).json({ plan: populated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating plan' });
  }
}

export async function commitSpot(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { role } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Check if already committed
    const existing = plan.members.find((m) => m.userId.toString() === userId);
    if (existing) {
      res.status(400).json({ error: 'User is already committed to this plan' });
      return;
    }

    // Add to members
    plan.members.push({
      userId: new mongoose.Types.ObjectId(userId),
      role: role || plan.role,
      committedAt: new Date(),
      reconfirmed: true,
      reconfirmedAt: new Date(),
    });

    // If on bench, remove
    plan.bench = plan.bench.filter((b) => b.userId.toString() !== userId);

    if (plan.members.length >= plan.requiredSpots) {
      plan.status = 'CONFIRMED';
    } else {
      plan.status = 'FILLING';
    }

    const health = evaluatePlanHealth(plan);
    plan.healthStatus = health.healthStatus;
    plan.healthReason = health.healthReason;

    await plan.save();

    await ParticipationEvent.create({
      userId: new mongoose.Types.ObjectId(userId),
      planId: plan._id,
      eventType: 'COMMIT',
      metadata: { role: role || plan.role },
    });

    // Notify creator
    const joiningUser = await User.findById(userId);
    await Notification.create({
      userId: plan.creatorId,
      type: 'MEMBER_JOINED',
      planId: plan._id,
      title: 'Spot Filled!',
      message: `${joiningUser?.name || 'A student'} committed to ${plan.activity} as ${role || plan.role}.`,
      actionUrl: `/plans/${plan._id}`,
    });

    const updated = await Plan.findById(id)
      .populate('creatorId', 'name avatar branch year')
      .populate('members.userId', 'name avatar branch year')
      .populate('bench.userId', 'name avatar branch year');

    res.json({ plan: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error committing spot' });
  }
}

export async function joinBench(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { role } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const alreadyBench = plan.bench.find((b) => b.userId.toString() === userId);
    if (alreadyBench) {
      res.status(400).json({ error: 'Already joined the Bench for this plan' });
      return;
    }

    plan.bench.push({
      userId: new mongoose.Types.ObjectId(userId),
      role: role || plan.role,
      joinedAt: new Date(),
      status: 'waiting',
    });

    const health = evaluatePlanHealth(plan);
    plan.healthStatus = health.healthStatus;
    plan.healthReason = health.healthReason;

    await plan.save();

    await ParticipationEvent.create({
      userId: new mongoose.Types.ObjectId(userId),
      planId: plan._id,
      eventType: 'BENCH_JOIN',
      metadata: { role: role || plan.role },
    });

    const updated = await Plan.findById(id)
      .populate('creatorId', 'name avatar branch year')
      .populate('members.userId', 'name avatar branch year')
      .populate('bench.userId', 'name avatar branch year');

    res.json({
      plan: updated,
      message: "You're on the Bench! If a spot opens, you will get first notice.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error joining Bench' });
  }
}

/**
 * Guilt-free spot release!
 * No forced excuse, zero penalty, triggers instant recovery flow.
 */
export async function releaseSpot(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const releasingMember = plan.members.find((m) => m.userId.toString() === userId);
    if (!releasingMember) {
      res.status(400).json({ error: 'User is not a committed member of this plan' });
      return;
    }

    // Remove from members
    plan.members = plan.members.filter((m) => m.userId.toString() !== userId);
    plan.status = 'AT_RISK';
    plan.healthStatus = 'AT_RISK';
    plan.healthReason = 'A committed member released their spot. Self-healing system activated.';

    await plan.save();

    // Record early release event (zero penalty design!)
    await ParticipationEvent.create({
      userId: new mongoose.Types.ObjectId(userId),
      planId: plan._id,
      eventType: 'EARLY_RELEASE',
      metadata: { role: releasingMember.role },
    });

    const releasingUser = await User.findById(userId);

    // Notify creator & team
    await Notification.create({
      userId: plan.creatorId,
      type: 'SPOT_RELEASED',
      planId: plan._id,
      title: '⚠ Spot Released',
      message: `${releasingUser?.name || 'A teammate'} released their spot. Bench backups are being inspected.`,
      actionUrl: `/plans/${plan._id}`,
    });

    // Post to plan chat
    await Message.create({
      planId: plan._id,
      senderId: new mongoose.Types.ObjectId(userId),
      text: `📢 ${releasingUser?.name || 'A participant'} released their spot. Self-healing plan recovery is active.`,
      isSystemAnnouncement: true,
    });

    const updated = await Plan.findById(id)
      .populate('creatorId', 'name avatar branch year')
      .populate('members.userId', 'name avatar branch year')
      .populate('bench.userId', 'name avatar branch year');

    res.json({
      plan: updated,
      message: "Thanks for letting us know early! We'll try to refill the spot with a bench backup.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error releasing spot' });
  }
}

export async function reconfirmSpot(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const member = plan.members.find((m) => m.userId.toString() === userId);
    if (!member) {
      res.status(400).json({ error: 'User is not a member of this plan' });
      return;
    }

    member.reconfirmed = true;
    member.reconfirmedAt = new Date();

    const health = evaluatePlanHealth(plan);
    plan.healthStatus = health.healthStatus;
    plan.healthReason = health.healthReason;

    await plan.save();

    await ParticipationEvent.create({
      userId: new mongoose.Types.ObjectId(userId),
      planId: plan._id,
      eventType: 'RECONFIRM',
      metadata: { role: member.role },
    });

    const updated = await Plan.findById(id)
      .populate('creatorId', 'name avatar branch year')
      .populate('members.userId', 'name avatar branch year')
      .populate('bench.userId', 'name avatar branch year');

    res.json({ plan: updated, message: "Reconfirmation confirmed! You're locked in." });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error reconfirming' });
  }
}

/**
 * Inspect recovery status & eligible bench candidates
 */
export async function getRecoveryStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const result = await inspectPlanRecovery(id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error inspecting recovery' });
  }
}

/**
 * Offer slot to bench backup candidate
 */
export async function offerBackupSlot(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { candidateUserId } = req.body;
    const result = await triggerSlotOffer(id, candidateUserId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error offering slot' });
  }
}

/**
 * Backup candidate accepts slot offer -> Plan Restored!
 */
export async function acceptBackupSlot(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { candidateUserId } = req.body;
    const updatedPlan = await acceptBenchOffer(id, candidateUserId);

    const populated = await Plan.findById(updatedPlan._id)
      .populate('creatorId', 'name avatar branch year')
      .populate('members.userId', 'name avatar branch year')
      .populate('bench.userId', 'name avatar branch year');

    res.json({ plan: populated, message: 'Plan restored successfully! Roster is complete.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error accepting backup slot' });
  }
}

/**
 * Activity time check-in with 4-digit code
 */
export async function checkIn(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;
    const { code } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    if (code && code !== plan.checkInCode) {
      res.status(400).json({ error: 'Invalid 4-digit check-in code' });
      return;
    }

    const alreadyCheckedIn = plan.checkIns.some((c) => c.userId.toString() === userId);
    if (!alreadyCheckedIn) {
      plan.checkIns.push({
        userId: new mongoose.Types.ObjectId(userId),
        checkedInAt: new Date(),
      });
    }

    // If majority or required spots checked in, mark as HAPPENED
    if (plan.checkIns.length >= Math.min(plan.requiredSpots, plan.members.length)) {
      plan.status = 'HAPPENED';
      plan.healthStatus = 'HIGH';
      plan.completedAt = new Date();
      plan.healthReason = '✅ IT HAPPENED! All members checked in on campus.';
    }

    await plan.save();

    await ParticipationEvent.create({
      userId: new mongoose.Types.ObjectId(userId),
      planId: plan._id,
      eventType: 'CHECK_IN',
    });

    const updated = await Plan.findById(id)
      .populate('creatorId', 'name avatar branch year')
      .populate('members.userId', 'name avatar branch year')
      .populate('checkIns.userId', 'name avatar branch year');

    res.json({ plan: updated, message: 'Check-in confirmed!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error checking in' });
  }
}

/**
 * Repeat crew creation: "Play again with this crew"
 */
export async function createRepeatCrew(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const plan = await Plan.findById(id);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    plan.repeatCrewCreated = true;
    plan.status = 'REPEAT';
    await plan.save();

    // Create a follow-up plan for next week
    const repeatPlan = await Plan.create({
      creatorId: plan.creatorId,
      activity: plan.activity,
      category: plan.category,
      role: plan.role,
      description: `Repeat session with proven crew from ${plan.date}!`,
      date: 'Next Saturday',
      startTime: plan.startTime,
      endTime: plan.endTime,
      location: plan.location,
      campusZone: plan.campusZone,
      requiredSpots: plan.requiredSpots,
      members: plan.members.map((m) => ({
        userId: m.userId,
        role: m.role,
        committedAt: new Date(),
        reconfirmed: true,
        reconfirmedAt: new Date(),
      })),
      bench: [],
      status: 'CONFIRMED',
      healthStatus: 'HIGH',
      healthReason: 'Repeat crew locked in from previous successful session.',
      reconfirmationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      checkInCode: Math.floor(1000 + Math.random() * 9000).toString(),
      checkIns: [],
    });

    res.json({ repeatPlan, message: 'Repeat session created with your crew!' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error creating repeat crew' });
  }
}

/**
 * Plan-scoped messages
 */
export async function getPlanMessages(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const messages = await Message.find({ planId: id })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function sendPlanMessage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.senderId;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const message = await Message.create({
      planId: new mongoose.Types.ObjectId(String(id)),
      senderId: new mongoose.Types.ObjectId(userId),
      text: text.trim(),
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name avatar');
    res.status(201).json({ message: populated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
