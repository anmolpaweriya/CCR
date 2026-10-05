import { Response, NextFunction } from 'express';
import { CreditLedgerService } from '../services/creditLedgerService.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { AuthRequest } from '../middleware/auth.js';

export class WalletController {
  /**
   * Get user's wallet overview
   */
  static async getMyWallet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const wallet = await CreditLedgerService.getWallet(user._id);

      const recentTransactions = await CreditTransaction.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(20);

      res.json({
        success: true,
        wallet: {
          cashCredits: wallet.cashCredits,
          goodwillCredits: wallet.goodwillCredits,
          withdrawableCashCredits: wallet.withdrawableCashCredits,
          pendingCashCredits: wallet.pendingCashCredits,
          totalCashEarned: wallet.totalCashEarned,
          totalCashSpent: wallet.totalCashSpent,
          totalGoodwillEarned: wallet.totalGoodwillEarned,
          totalGoodwillSpent: wallet.totalGoodwillSpent,
        },
        recentTransactions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transactions with filtering
   */
  static async getTransactions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { creditType, type } = req.query;
      const query: any = { user: user._id };

      if (creditType && creditType !== 'ALL') {
        query.creditType = creditType;
      }
      if (type && type !== 'ALL') {
        query.transactionType = type;
      }

      const transactions = await CreditTransaction.find(query)
        .sort({ createdAt: -1 })
        .limit(100);

      res.json({ success: true, transactions });
    } catch (error) {
      next(error);
    }
  }
}
