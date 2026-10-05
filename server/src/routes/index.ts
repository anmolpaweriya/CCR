import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import assistanceRoutes from './assistanceRoutes.js';
import resourceRoutes from './resourceRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import valuationRoutes from './valuationRoutes.js';
import walletRoutes from './walletRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import withdrawalRoutes from './withdrawalRoutes.js';
import goodwillRoutes from './goodwillRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import disputeRoutes from './disputeRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/assistance', assistanceRoutes);
router.use('/resources', resourceRoutes);
router.use('/matching', matchingRoutes);
router.use('/valuation', valuationRoutes);
router.use('/wallet', walletRoutes);
router.use('/payments', paymentRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/goodwill', goodwillRoutes);
router.use('/notifications', notificationRoutes);
router.use('/disputes', disputeRoutes);
router.use('/admin', adminRoutes);

export default router;
