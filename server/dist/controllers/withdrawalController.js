"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalController = void 0;
const Withdrawal_js_1 = require("../models/Withdrawal.js");
const creditLedgerService_js_1 = require("../services/creditLedgerService.js");
class WithdrawalController {
    /**
     * Request simulated demo withdrawal
     */
    static async requestWithdrawal(req, res, next) {
        try {
            const user = req.user;
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
            const withdrawal = await Withdrawal_js_1.Withdrawal.create({
                user: user._id,
                amount: creditsToWithdraw,
                creditType: 'cash_credit',
                payoutMethod: payoutMethod || 'UPI',
                payoutDetails,
                status: 'REQUESTED',
            });
            // Deduct from wallet and log pending ledger transaction
            const result = await creditLedgerService_js_1.CreditLedgerService.requestWithdrawal(user._id, creditsToWithdraw, withdrawal._id.toString(), `Demo Withdrawal request: ${creditsToWithdraw} Cash Credits to ${payoutMethod} (${payoutDetails})`);
            if (!result.success) {
                await Withdrawal_js_1.Withdrawal.findByIdAndDelete(withdrawal._id);
                res.status(400).json({ success: false, message: result.message });
                return;
            }
            const updatedWallet = await creditLedgerService_js_1.CreditLedgerService.getWallet(user._id);
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get user's withdrawal requests
     */
    static async getMyWithdrawals(req, res, next) {
        try {
            const user = req.user;
            const withdrawals = await Withdrawal_js_1.Withdrawal.find({ user: user._id }).sort({ createdAt: -1 });
            res.json({ success: true, withdrawals });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WithdrawalController = WithdrawalController;
