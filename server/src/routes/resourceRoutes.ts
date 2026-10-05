import { Router } from 'express';
import { ResourceController } from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, ResourceController.create);
router.get('/', authenticate, ResourceController.getAll);
router.get('/:id', authenticate, ResourceController.getById);
router.post('/:id/request', authenticate, ResourceController.requestResource);
router.post('/requests/:requestId/decision', authenticate, ResourceController.handleRequestDecision);
router.patch('/requests/:requestId/status', authenticate, ResourceController.updateRequestStatus);
router.post('/requests/:requestId/verify-return', authenticate, ResourceController.verifyReturn);

export default router;
