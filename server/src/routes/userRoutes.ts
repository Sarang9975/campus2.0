import { Router } from 'express';
import { getUserProfile, getAllUsers } from '../controllers/userController.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserProfile);

export default router;
