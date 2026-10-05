import { Router } from 'express';
import { WalletController } from '../controllers/walletController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, WalletController.getMyWallet);
router.get('/transactions', authenticate, WalletController.getTransactions);

export default router;
