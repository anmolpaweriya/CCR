"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const creditLedgerService_js_1 = require("../services/creditLedgerService.js");
const CreditTransaction_js_1 = require("../models/CreditTransaction.js");
class WalletController {
    /**
     * Get user's wallet overview
     */
    static async getMyWallet(req, res, next) {
        try {
            const user = req.user;
            const wallet = await creditLedgerService_js_1.CreditLedgerService.getWallet(user._id);
            const recentTransactions = await CreditTransaction_js_1.CreditTransaction.find({ user: user._id })
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get transactions with filtering
     */
    static async getTransactions(req, res, next) {
        try {
            const user = req.user;
            const { creditType, type } = req.query;
            const query = { user: user._id };
            if (creditType && creditType !== 'ALL') {
                query.creditType = creditType;
            }
            if (type && type !== 'ALL') {
                query.transactionType = type;
            }
            const transactions = await CreditTransaction_js_1.CreditTransaction.find(query)
                .sort({ createdAt: -1 })
                .limit(100);
            res.json({ success: true, transactions });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WalletController = WalletController;
