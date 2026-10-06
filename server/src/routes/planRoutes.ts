import { Router } from 'express';
import {
  getPlans,
  getPlanById,
  createPlan,
  commitSpot,
  releaseSpot,
  reconfirmSpot,
  joinBench,
  getRecoveryStatus,
  offerBackupSlot,
  acceptBackupSlot,
  checkIn,
  createRepeatCrew,
  getPlanMessages,
  sendPlanMessage,
} from '../controllers/planController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', getPlans);
router.post('/', createPlan);
router.get('/:id', getPlanById);
router.post('/:id/commit', commitSpot);
router.post('/:id/release', releaseSpot);
router.post('/:id/reconfirm', reconfirmSpot);
router.post('/:id/bench', joinBench);

// Self-healing Recovery endpoints
router.get('/:id/recovery', getRecoveryStatus);
router.post('/:id/recovery/offer', offerBackupSlot);
router.post('/:id/recovery/accept', acceptBackupSlot);

// Real-world North Star Check-in & Repeat
router.post('/:id/check-in', checkIn);
router.post('/:id/repeat', createRepeatCrew);

// Plan-scoped messaging
router.get('/:id/messages', getPlanMessages);
router.post('/:id/messages', sendPlanMessage);

export default router;
