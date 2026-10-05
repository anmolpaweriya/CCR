import { Router } from 'express';
import { MatchingController } from '../controllers/matchingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/assistance/:requestId', authenticate, MatchingController.getMatchesForRequest);

export default router;
