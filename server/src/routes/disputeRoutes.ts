import { Router } from 'express';
import { DisputeController } from '../controllers/disputeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, DisputeController.create);
router.get('/me', authenticate, DisputeController.getMyDisputes);

export default router;
