import { Router } from 'express';
import { WithdrawalController } from '../controllers/withdrawalController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/request', authenticate, WithdrawalController.requestWithdrawal);
router.get('/me', authenticate, WithdrawalController.getMyWithdrawals);

export default router;
