import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { Resource } from '../models/Resource.js';
import { Payment } from '../models/Payment.js';
import { Withdrawal } from '../models/Withdrawal.js';
import { Dispute } from '../models/Dispute.js';
import { GoodwillTransaction } from '../models/GoodwillTransaction.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { CreditLedgerService } from '../services/creditLedgerService.js';
import { AuthRequest } from '../middleware/auth.js';

export class AdminController {
  /**
   * Platform Overview Statistics & Recharts analytics
   */
  static async getOverviewStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isSuspended: false });
      const totalAssistanceRequests = await AssistanceRequest.countDocuments();
      const completedAssistance = await AssistanceRequest.countDocuments({ status: 'VERIFIED' });
      const totalResources = await Resource.countDocuments();
      const borrowedResources = await Resource.countDocuments({ status: 'BORROWED' });
      const pendingWithdrawals = await Withdrawal.countDocuments({ status: 'REQUESTED' });
      const pendingDisputes = await Dispute.countDocuments({ status: 'OPEN' });
      const demoPayments = await Payment.countDocuments({ status: 'SUCCESS' });

      // Total credits in circulation
      const wallets = await Wallet.find();
      const cashCirculation = wallets.reduce((acc, w) => acc + (w.cashCredits || 0), 0);
      const goodwillCirculation = wallets.reduce((acc, w) => acc + (w.goodwillCredits || 0), 0);

      // Aggregate chart data (last 7 days simulated / realistic distribution)
      const chartData = [
        { name: 'Mon', cashSpent: 120, goodwillEarned: 85, requests: 14, contributions: 12 },
        { name: 'Tue', cashSpent: 210, goodwillEarned: 130, requests: 22, contributions: 19 },
        { name: 'Wed', cashSpent: 180, goodwillEarned: 140, requests: 18, contributions: 16 },
        { name: 'Thu', cashSpent: 290, goodwillEarned: 190, requests: 27, contributions: 24 },
        { name: 'Fri', cashSpent: 340, goodwillEarned: 240, requests: 35, contributions: 31 },
        { name: 'Sat', cashSpent: 480, goodwillEarned: 320, requests: 46, contributions: 42 },
        { name: 'Sun', cashSpent: 410, goodwillEarned: 290, requests: 39, contributions: 36 },
      ];

      res.json({
        success: true,
        stats: {
          totalUsers,
          activeUsers,
          totalAssistanceRequests,
          completedAssistance,
          totalResources,
          borrowedResources,
          cashCirculation,
          goodwillCirculation,
          pendingWithdrawals,
          pendingDisputes,
          demoPayments,
        },
        chartData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users with search and filter
   */
  static async getUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, role, isSuspended } = req.query;
      const query: any = {};

      if (role && role !== 'ALL') query.role = role;
      if (isSuspended !== undefined && isSuspended !== 'ALL') {
        query.isSuspended = isSuspended === 'true';
      }
      if (search) {
        query.$or = [
          { name: { $regex: String(search), $options: 'i' } },
          { email: { $regex: String(search), $options: 'i' } },
          { locationZone: { $regex: String(search), $options: 'i' } },
        ];
      }

      const users = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });

      // Attach wallet balances
      const usersWithWallets = await Promise.all(
        users.map(async (u) => {
          const wallet = await Wallet.findOne({ user: u._id });
          return {
            ...u.toObject(),
            wallet: wallet
              ? {
                  cashCredits: wallet.cashCredits,
                  goodwillCredits: wallet.goodwillCredits,
                  withdrawableCashCredits: wallet.withdrawableCashCredits,
                }
              : null,
          };
        })
      );

      res.json({ success: true, users: usersWithWallets });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suspend or reactivate user
   */
  static async toggleSuspendUser(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const admin = req.user!;
      const { reason } = req.body;
      const user = await User.findById(req.params.id);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const previousState = { isSuspended: user.isSuspended };
      user.isSuspended = !user.isSuspended;
      await user.save();

      const action = user.isSuspended ? 'USER_SUSPENDED' : 'USER_ACTIVATED';

      // Mandatory Audit Log
      await AdminAuditLog.create({
        admin: admin._id,
        action,
        entity: 'User',
        entityId: user._id.toString(),
        previousState,
        newState: { isSuspended: user.isSuspended },
        reason: reason || (user.isSuspended ? 'Suspended by admin' : 'Reactivated by admin'),
      });

      res.json({
        success: true,
        message: user.isSuspended ? 'User suspended successfully' : 'User reactivated successfully',
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin credit adjustment (Never silently modify balances!)
   */
  static async adjustCredits(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = req.user!;
      const { creditType, amount, reason } = req.body;

      if (!creditType || amount === undefined || !reason) {
        res.status(400).json({
          success: false,
          message: 'creditType, amount, and reason are required for credit adjustments',
        });
        return;
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const { balanceBefore, balanceAfter } = await CreditLedgerService.adminAdjustCredits(
        user._id,
        creditType,
        parseInt(amount, 10),
        reason,
        admin._id
      );

      // Mandatory Audit Log
      await AdminAuditLog.create({
        admin: admin._id,
        action: 'CREDIT_ADJUSTED',
        entity: 'Wallet',
        entityId: user._id.toString(),
        previousState: { [creditType]: balanceBefore },
        newState: { [creditType]: balanceAfter },
        reason,
      });

      res.json({
        success: true,
        message: `Successfully adjusted ${amount} ${creditType}. New balance: ${balanceAfter}`,
        balanceBefore,
        balanceAfter,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all withdrawals
   */
  static async getWithdrawals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const withdrawals = await Withdrawal.find()
        .populate('user', 'name email locationZone reputationScore')
        .sort({ createdAt: -1 });

      res.json({ success: true, withdrawals });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve or reject demo withdrawal
   */
  static async handleWithdrawal(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const admin = req.user!;
      const { action, reason } = req.body; // action: 'APPROVE' or 'REJECT'
      const withdrawal = await Withdrawal.findById(req.params.id);

      if (!withdrawal) {
        res.status(404).json({ success: false, message: 'Withdrawal not found' });
        return;
      }

      if (withdrawal.status !== 'REQUESTED') {
        res.status(400).json({ success: false, message: 'Withdrawal already processed' });
        return;
      }

      const isApproved = action === 'APPROVE';
      if (!isApproved && !reason) {
        res.status(400).json({ success: false, message: 'A rejection reason is required' });
        return;
      }

      const previousStatus = withdrawal.status;
      withdrawal.status = isApproved ? 'COMPLETED' : 'REJECTED';
      withdrawal.adminReason = reason || (isApproved ? 'Approved by admin' : 'Rejected');
      withdrawal.reviewedBy = admin._id;
      withdrawal.reviewedAt = new Date();
      await withdrawal.save();

      // Update wallet and ledger
      await CreditLedgerService.completeWithdrawal(
        withdrawal.user,
        withdrawal.amount,
        withdrawal._id.toString(),
        isApproved,
        withdrawal.adminReason
      );

      // Mandatory Audit Log
      await AdminAuditLog.create({
        admin: admin._id,
        action: isApproved ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
        entity: 'Withdrawal',
        entityId: withdrawal._id.toString(),
        previousState: { status: previousStatus },
        newState: { status: withdrawal.status },
        reason: withdrawal.adminReason,
      });

      res.json({
        success: true,
        message: isApproved ? 'Demo withdrawal approved!' : 'Demo withdrawal rejected and credits refunded.',
        withdrawal,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all assistance requests for moderation
   */
  static async getRequests(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const requests = await AssistanceRequest.find()
        .populate('requester', 'name email locationZone')
        .populate('selectedContributor', 'name email')
        .sort({ createdAt: -1 });

      res.json({ success: true, requests });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all resources for moderation
   */
  static async getResources(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resources = await Resource.find()
        .populate('owner', 'name email locationZone')
        .sort({ createdAt: -1 });

      res.json({ success: true, resources });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get disputes
   */
  static async getDisputes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const disputes = await Dispute.find()
        .populate('requester', 'name email')
        .populate('contributor', 'name email')
        .sort({ createdAt: -1 });

      res.json({ success: true, disputes });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resolve dispute
   */
  static async resolveDispute(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const admin = req.user!;
      const { resolution, resolutionNotes } = req.body; // 'RESOLVED_REQUESTER', 'RESOLVED_CONTRIBUTOR', 'REFUNDED'
      const dispute = await Dispute.findById(req.params.id);

      if (!dispute) {
        res.status(404).json({ success: false, message: 'Dispute not found' });
        return;
      }

      const previousStatus = dispute.status;
      dispute.status = resolution;
      dispute.resolutionNotes = resolutionNotes || 'Resolved by administrator';
      dispute.resolvedBy = admin._id;
      dispute.resolvedAt = new Date();
      await dispute.save();

      // If refunding requester
      if (resolution === 'REFUNDED' || resolution === 'RESOLVED_REQUESTER') {
        await CreditLedgerService.depositCashCredits(
          dispute.requester,
          dispute.creditAmount,
          'ASSISTANCE_REQUEST',
          dispute._id.toString(),
          `Dispute resolution refund: ${dispute.reason}`
        );
      } else if (resolution === 'RESOLVED_CONTRIBUTOR') {
        await CreditLedgerService.awardContributionCredits(
          dispute.contributor,
          dispute.creditType,
          dispute.creditAmount,
          'ASSISTANCE_REQUEST',
          dispute.referenceId,
          `Dispute resolved in contributor favor: ${dispute.reason}`,
          `DISPUTE-SETTLE-${dispute._id}`
        );
      }

      // Mandatory Audit Log
      await AdminAuditLog.create({
        admin: admin._id,
        action: 'DISPUTE_RESOLVED',
        entity: 'Dispute',
        entityId: dispute._id.toString(),
        previousState: { status: previousStatus },
        newState: { status: dispute.status },
        reason: dispute.resolutionNotes,
      });

      res.json({ success: true, message: 'Dispute resolved successfully', dispute });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await AdminAuditLog.find()
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({ success: true, logs });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get goodwill transactions audit
   */
  static async getGoodwillTransactions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const transactions = await GoodwillTransaction.find()
        .populate('contributor', 'name email locationZone')
        .populate('recipient', 'name email locationZone')
        .sort({ createdAt: -1 });

      res.json({ success: true, transactions });
    } catch (error) {
      next(error);
    }
  }
}
