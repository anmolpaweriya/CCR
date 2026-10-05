import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.put('/profile', authenticate, UserController.updateProfile);
router.get('/leaders', UserController.getCommunityHelpers);
router.get('/:id', UserController.getPublicProfile);

export default router;
