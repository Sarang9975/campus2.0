import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { calculateCandidateReliability } from '../services/behavioralReliabilityService.js';
import { ParticipationEvent } from '../models/ParticipationEvent.js';
import mongoose from 'mongoose';

export async function getUserProfile(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Calculate private reliability and audit history
    const reliability = await calculateCandidateReliability(id);
    const recentEvents = await ParticipationEvent.find({ userId: new mongoose.Types.ObjectId(id) })
      .populate('planId', 'activity role date')
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      user,
      privateHistory: {
        reliability,
        recentEvents,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching user profile' });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await User.find().select('name email avatar branch year roles campusZone verified');
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
