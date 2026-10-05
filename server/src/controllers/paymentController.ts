import { Response, NextFunction } from 'express';
import { Payment } from '../models/Payment.js';
import { CreditLedgerService } from '../services/creditLedgerService.js';
import { AuthRequest } from '../middleware/auth.js';

export class PaymentController {
  /**
   * Process simulated Demo Payment
   */
  static async processDemoPayment(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const { credits, cardNumber } = req.body;

      const creditsToBuy = parseInt(credits, 10);
      if (isNaN(creditsToBuy) || creditsToBuy <= 0) {
        res.status(400).json({ success: false, message: 'Invalid credit amount requested' });
        return;
      }

      // Demo Card Rules:
      // 4000...0002 triggers simulated failure
      // Any other card (standard 4242...) succeeds
      const cleanCard = (cardNumber || '').replace(/\s+/g, '');
      const isSimulatedFailure = cleanCard === '4000000000000002';
      const cardLast4 = cleanCard.slice(-4) || '4242';
      const transactionId = `DEMO-PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      if (isSimulatedFailure) {
        await Payment.create({
          user: user._id,
          amount: creditsToBuy,
          credits: creditsToBuy,
          provider: 'DEMO_PAYMENT',
          status: 'FAILED',
          transactionId,
          cardLast4,
          failureReason: 'Card declined by demo payment gateway (Simulated test failure)',
        });

        res.status(402).json({
          success: false,
          message: 'Payment failed: The demo card was declined (Simulated failure card: 4000 0000 0000 0002).',
          transactionId,
        });
        return;
      }

      // Simulated Success
      await Payment.create({
        user: user._id,
        amount: creditsToBuy,
        credits: creditsToBuy,
        provider: 'DEMO_PAYMENT',
        status: 'SUCCESS',
        transactionId,
        cardLast4,
      });

      // Deposit Cash Credits into wallet and create ledger transaction
      await CreditLedgerService.depositCashCredits(
        user._id,
        creditsToBuy,
        'PAYMENT',
        transactionId,
        `Demo Top-Up: Purchased ${creditsToBuy} Cash Credits (Card ending in ${cardLast4})`
      );

      const updatedWallet = await CreditLedgerService.getWallet(user._id);

      res.json({
        success: true,
        message: `Successfully added ${creditsToBuy} Cash Credits! (Demo Payment — No real money processed)`,
        transactionId,
        wallet: {
          cashCredits: updatedWallet.cashCredits,
          goodwillCredits: updatedWallet.goodwillCredits,
          withdrawableCashCredits: updatedWallet.withdrawableCashCredits,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
