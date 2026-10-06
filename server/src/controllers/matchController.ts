import { Request, Response } from 'express';
import { Plan } from '../models/Plan.js';
import { findMatchesForPlan } from '../services/matchingService.js';

export async function getMatches(req: Request, res: Response): Promise<void> {
  try {
    const { planId } = req.query;
    if (!planId) {
      res.status(400).json({ error: 'planId query parameter is required' });
      return;
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    const matches = await findMatchesForPlan(plan);
    res.json({ planId, matches });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error finding matches' });
  }
}
