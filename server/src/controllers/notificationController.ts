import { Request, Response } from 'express';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';

export async function getNotifications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      res.status(400).json({ error: 'User identifier required' });
      return;
    }

    const notifications = await Notification.find({ userId: new mongoose.Types.ObjectId(String(userId)) })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(String(userId)),
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error fetching notifications' });
  }
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { read: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id || req.body.userId;
    if (userId) {
      await Notification.updateMany({ userId: new mongoose.Types.ObjectId(String(userId)) }, { read: true });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
