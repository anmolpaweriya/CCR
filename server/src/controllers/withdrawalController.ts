import { Response, NextFunction } from 'express';
import { Withdrawal } from '../models/Withdrawal.js';
import { CreditLedgerService } from '../services/creditLedgerService.js';
import { AuthRequest } from '../middleware/auth.js';

export class WithdrawalController {
  /**
   * Request simulated demo withdrawal
   */
  static async requestWithdrawal(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const { amount, payoutMethod, payoutDetails } = req.body;

      const creditsToWithdraw = parseInt(amount, 10);
      if (isNaN(creditsToWithdraw) || creditsToWithdraw <= 0) {
        res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
        return;
      }

      if (!payoutDetails) {
        res.status(400).json({ success: false, message: 'Payout details (UPI ID or Bank Account) are required' });
        return;
      }

      // Create withdrawal document
      const withdrawal = await Withdrawal.create({
        user: user._id,
        amount: creditsToWithdraw,
        creditType: 'cash_credit',
        payoutMethod: payoutMethod || 'UPI',
        payoutDetails,
        status: 'REQUESTED',
      });

      // Deduct from wallet and log pending ledger transaction
      const result = await CreditLedgerService.requestWithdrawal(
        user._id,
        creditsToWithdraw,
        withdrawal._id.toString(),
        `Demo Withdrawal request: ${creditsToWithdraw} Cash Credits to ${payoutMethod} (${payoutDetails})`
      );

      if (!result.success) {
        await Withdrawal.findByIdAndDelete(withdrawal._id);
        res.status(400).json({ success: false, message: result.message });
        return;
      }

      const updatedWallet = await CreditLedgerService.getWallet(user._id);

      res.status(201).json({
        success: true,
        message: 'Demo withdrawal requested successfully! Pending administrator review.',
        withdrawal,
        wallet: {
          cashCredits: updatedWallet.cashCredits,
          withdrawableCashCredits: updatedWallet.withdrawableCashCredits,
          pendingCashCredits: updatedWallet.pendingCashCredits,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's withdrawal requests
   */
  static async getMyWithdrawals(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const withdrawals = await Withdrawal.find({ user: user._id }).sort({ createdAt: -1 });

      res.json({ success: true, withdrawals });
    } catch (error) {
      next(error);
    }
  }
}
