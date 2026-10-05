import { Router } from 'express';
import { ValuationController } from '../controllers/valuationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/assistance', authenticate, ValuationController.evaluateAssistance);
router.post('/resource', authenticate, ValuationController.evaluateResource);

export default router;
