import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/demo-checkout', authenticate, PaymentController.processDemoPayment);

export default router;
