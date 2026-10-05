import { Router } from 'express';
import { AssistanceController } from '../controllers/assistanceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, AssistanceController.create);
router.get('/', authenticate, AssistanceController.getAll);
router.get('/:id', authenticate, AssistanceController.getById);
router.post('/:id/apply', authenticate, AssistanceController.apply);
router.post('/:id/select-contributor', authenticate, AssistanceController.selectContributor);
router.patch('/:id/status', authenticate, AssistanceController.updateStatus);
router.post('/:id/verify', authenticate, AssistanceController.verify);

export default router;
