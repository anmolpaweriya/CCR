import { Router } from 'express';
import { GoodwillController } from '../controllers/goodwillController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/opportunities', authenticate, GoodwillController.getOpportunities);
router.get('/my-history', authenticate, GoodwillController.getMyHistory);

export default router;
