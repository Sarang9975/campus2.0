import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Plan } from '../models/Plan.js';
import { Notification } from '../models/Notification.js';
import { Message } from '../models/Message.js';
import { ParticipationEvent } from '../models/ParticipationEvent.js';
import { seedDatabase } from '../seed/seedRunner.js';
import mongoose from 'mongoose';

export async function resetDemo(req: Request, res: Response): Promise<void> {
  try {
    const result = await seedDatabase();
    res.json({ message: 'Demo environment reset and seeded successfully', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error resetting demo' });
  }
}

/**
 * Triggers Riya releasing her spot to demonstrate self-healing in real-time
 */
export async function triggerDemoRelease(req: Request, res: Response): Promise<void> {
  try {
    const plan = await Plan.findOne({ activity: { $regex: 'Smart India Hackathon', $options: 'i' } });
    if (!plan) {
      res.status(404).json({ error: 'Demo hackathon plan not found. Reset demo first.' });
      return;
    }

    const riya = await User.findOne({ email: 'riya.sharma@manit.ac.in' });
    if (!riya) {
      res.status(404).json({ error: 'Riya user not found' });
      return;
    }

    // Release Riya's spot
    plan.members = plan.members.filter((m) => m.userId.toString() !== riya._id.toString());
    plan.status = 'AT_RISK';
    plan.healthStatus = 'AT_RISK';
    plan.healthReason = '⚠ Riya released her UI Designer spot. 1 slot open. Self-healing active.';
    await plan.save();

    await ParticipationEvent.create({
      userId: riya._id,
      planId: plan._id,
      eventType: 'EARLY_RELEASE',
      metadata: { role: 'UI Designer' },
    });

    await Notification.create({
      userId: plan.creatorId,
      type: 'SPOT_RELEASED',
      planId: plan._id,
      title: '⚠ Spot Released: Smart India Hackathon',
      message: 'Riya released her spot early. Self-healing plan recovery is inspecting Bench backups.',
      actionUrl: `/plans/${plan._id}`,
    });

    await Message.create({
      planId: plan._id,
      senderId: riya._id,
      text: 'Hey team, an urgent lab test came up on Saturday so I released my spot early so someone on the Bench can take it! Best of luck!',
      isSystemAnnouncement: false,
    });

    res.json({
      success: true,
      planId: plan._id,
      message: 'Riya released spot. Plan is now AT RISK. Ready for recovery step.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
