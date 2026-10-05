import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, requireAdmin);

router.get('/stats', AdminController.getOverviewStats);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/suspend', AdminController.toggleSuspendUser);
router.post('/users/:id/adjust-credits', AdminController.adjustCredits);
router.get('/withdrawals', AdminController.getWithdrawals);
router.patch('/withdrawals/:id', AdminController.handleWithdrawal);
router.get('/requests', AdminController.getRequests);
router.get('/resources', AdminController.getResources);
router.get('/disputes', AdminController.getDisputes);
router.patch('/disputes/:id', AdminController.resolveDispute);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/goodwill-transactions', AdminController.getGoodwillTransactions);

export default router;
