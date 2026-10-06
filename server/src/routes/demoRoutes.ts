import { Router } from 'express';
import { resetDemo, triggerDemoRelease } from '../controllers/demoController.js';

const router = Router();

router.post('/reset', resetDemo);
router.post('/trigger-release', triggerDemoRelease);

export default router;
