"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditLedgerService = void 0;
const Wallet_js_1 = require("../models/Wallet.js");
const CreditTransaction_js_1 = require("../models/CreditTransaction.js");
class CreditLedgerService {
    /**
     * Get or initialize a user's wallet
     */
    static async getWallet(userId) {
        let wallet = await Wallet_js_1.Wallet.findOne({ user: userId });
        if (!wallet) {
            wallet = await Wallet_js_1.Wallet.create({
                user: userId,
                cashCredits: 0,
                goodwillCredits: 0,
                totalCashEarned: 0,
                totalCashSpent: 0,
                totalGoodwillEarned: 0,
                totalGoodwillSpent: 0,
                pendingCashCredits: 0,
                withdrawableCashCredits: 0,
            });
        }
        return wallet;
    }
    /**
     * Spends credits using Priority Logic:
     * Uses Goodwill Credits FIRST if allowGoodwill is true,
     * then uses Cash Credits for the remainder.
     */
    static async spendCredits(userId, amount, referenceType, referenceId, description, allowGoodwill = true) {
        const wallet = await this.getWallet(userId);
        let goodwillToSpend = 0;
        let cashToSpend = 0;
        if (allowGoodwill) {
            goodwillToSpend = Math.min(wallet.goodwillCredits, amount);
            cashToSpend = amount - goodwillToSpend;
        }
        else {
            cashToSpend = amount;
        }
        if (wallet.cashCredits < cashToSpend) {
            return {
                success: false,
                goodwillSpent: 0,
                cashSpent: 0,
                totalSpent: 0,
                message: `Insufficient credits. Required: ${cashToSpend} Cash Credits, but you have ${wallet.cashCredits} Cash Credits.`,
            };
        }
        // Spend Goodwill Credits first
        if (goodwillToSpend > 0) {
            const balanceBefore = wallet.goodwillCredits;
            wallet.goodwillCredits -= goodwillToSpend;
            wallet.totalGoodwillSpent += goodwillToSpend;
            const balanceAfter = wallet.goodwillCredits;
            await CreditTransaction_js_1.CreditTransaction.create({
                user: userId,
                creditType: 'goodwill_credit',
                transactionType: referenceType === 'RESOURCE_REQUEST' ? 'RESOURCE_PAYMENT' : 'ASSISTANCE_PAYMENT',
                amount: goodwillToSpend,
                balanceBefore,
                balanceAfter,
                referenceType,
                referenceId,
                description: `${description} (Paid via Goodwill Credits)`,
                status: 'COMPLETED',
            });
        }
        // Spend Cash Credits for the remainder
        if (cashToSpend > 0) {
            const balanceBefore = wallet.cashCredits;
            wallet.cashCredits -= cashToSpend;
            wallet.totalCashSpent += cashToSpend;
            wallet.withdrawableCashCredits = Math.max(0, wallet.cashCredits);
            const balanceAfter = wallet.cashCredits;
            await CreditTransaction_js_1.CreditTransaction.create({
                user: userId,
                creditType: 'cash_credit',
                transactionType: referenceType === 'RESOURCE_REQUEST' ? 'RESOURCE_PAYMENT' : 'ASSISTANCE_PAYMENT',
                amount: cashToSpend,
                balanceBefore,
                balanceAfter,
                referenceType,
                referenceId,
                description: `${description} (Paid via Cash Credits)`,
                status: 'COMPLETED',
            });
        }
        await wallet.save();
        return {
            success: true,
            goodwillSpent: goodwillToSpend,
            cashSpent: cashToSpend,
            totalSpent: amount,
        };
    }
    /**
     * Deposit Cash Credits (e.g. from Demo Top-Up)
     */
    static async depositCashCredits(userId, amount, referenceType, referenceId, description) {
        const wallet = await this.getWallet(userId);
        const balanceBefore = wallet.cashCredits;
        wallet.cashCredits += amount;
        wallet.withdrawableCashCredits = wallet.cashCredits;
        wallet.totalCashEarned += amount;
        const balanceAfter = wallet.cashCredits;
        await wallet.save();
        await CreditTransaction_js_1.CreditTransaction.create({
            user: userId,
            creditType: 'cash_credit',
            transactionType: 'TOPUP',
            amount,
            balanceBefore,
            balanceAfter,
            referenceType,
            referenceId,
            description,
            status: 'COMPLETED',
        });
    }
    /**
     * Award Credits for Contribution (Idempotent settlement check)
     */
    static async awardContributionCredits(userId, creditType, amount, referenceType, referenceId, description, settlementId) {
        // Check if settlement already processed
        const existing = await CreditTransaction_js_1.CreditTransaction.findOne({
            referenceId: settlementId,
            status: 'COMPLETED',
        });
        if (existing) {
            console.warn(`⚠️ Duplicate settlement prevented for ID: ${settlementId}`);
            return false; // Idempotent: do not credit again
        }
        const wallet = await this.getWallet(userId);
        if (creditType === 'goodwill_credit') {
            const balanceBefore = wallet.goodwillCredits;
            wallet.goodwillCredits += amount;
            wallet.totalGoodwillEarned += amount;
            const balanceAfter = wallet.goodwillCredits;
            await wallet.save();
            await CreditTransaction_js_1.CreditTransaction.create({
                user: userId,
                creditType: 'goodwill_credit',
                transactionType: 'GOODWILL_REWARD',
                amount,
                balanceBefore,
                balanceAfter,
                referenceType,
                referenceId: settlementId,
                description,
                status: 'COMPLETED',
            });
        }
        else {
            const balanceBefore = wallet.cashCredits;
            wallet.cashCredits += amount;
            wallet.totalCashEarned += amount;
            wallet.withdrawableCashCredits = wallet.cashCredits;
            const balanceAfter = wallet.cashCredits;
            await wallet.save();
            await CreditTransaction_js_1.CreditTransaction.create({
                user: userId,
                creditType: 'cash_credit',
                transactionType: referenceType === 'RESOURCE_REQUEST' ? 'RESOURCE_EARNING' : 'ASSISTANCE_EARNING',
                amount,
                balanceBefore,
                balanceAfter,
                referenceType,
                referenceId: settlementId,
                description,
                status: 'COMPLETED',
            });
        }
        return true;
    }
    /**
     * Deduct Cash Credits for Demo Withdrawal
     */
    static async requestWithdrawal(userId, amount, withdrawalId, description) {
        const wallet = await this.getWallet(userId);
        // Only Cash Credits can be withdrawn! Goodwill is strictly non-withdrawable.
        if (wallet.cashCredits < amount) {
            return {
                success: false,
                message: `Insufficient withdrawable Cash Credits. Available: ${wallet.cashCredits} Cash Credits. Note: Goodwill Credits are strictly community-only and non-withdrawable.`,
            };
        }
        const balanceBefore = wallet.cashCredits;
        wallet.cashCredits -= amount;
        wallet.withdrawableCashCredits = wallet.cashCredits;
        wallet.pendingCashCredits += amount;
        const balanceAfter = wallet.cashCredits;
        await wallet.save();
        await CreditTransaction_js_1.CreditTransaction.create({
            user: userId,
            creditType: 'cash_credit',
            transactionType: 'WITHDRAWAL',
            amount,
            balanceBefore,
            balanceAfter,
            referenceType: 'WITHDRAWAL',
            referenceId: withdrawalId,
            description,
            status: 'PENDING',
        });
        return { success: true };
    }
    /**
     * Complete or reject withdrawal by Admin
     */
    static async completeWithdrawal(userId, amount, withdrawalId, isApproved, reason) {
        const wallet = await this.getWallet(userId);
        wallet.pendingCashCredits = Math.max(0, wallet.pendingCashCredits - amount);
        if (isApproved) {
            wallet.totalCashSpent += amount;
            await wallet.save();
            await CreditTransaction_js_1.CreditTransaction.updateOne({ referenceId: withdrawalId, referenceType: 'WITHDRAWAL' }, { status: 'COMPLETED', description: `Withdrawal approved: ${amount} Cash Credits` });
        }
        else {
            // Revert credits back to user
            const balanceBefore = wallet.cashCredits;
            wallet.cashCredits += amount;
            wallet.withdrawableCashCredits = wallet.cashCredits;
            const balanceAfter = wallet.cashCredits;
            await wallet.save();
            await CreditTransaction_js_1.CreditTransaction.updateOne({ referenceId: withdrawalId, referenceType: 'WITHDRAWAL' }, {
                status: 'REVERTED',
                description: `Withdrawal rejected: ${reason || 'Admin rejected'}. ${amount} Cash Credits restored.`,
            });
            await CreditTransaction_js_1.CreditTransaction.create({
                user: userId,
                creditType: 'cash_credit',
                transactionType: 'REFUND',
                amount,
                balanceBefore,
                balanceAfter,
                referenceType: 'WITHDRAWAL',
                referenceId: withdrawalId,
                description: `Refund for rejected withdrawal: ${reason || 'Not approved'}`,
                status: 'COMPLETED',
            });
        }
    }
    /**
     * Admin manual credit adjustment with mandatory audit trail
     */
    static async adminAdjustCredits(userId, creditType, amount, // positive to add, negative to subtract
    reason, adminId) {
        const wallet = await this.getWallet(userId);
        let balanceBefore = 0;
        let balanceAfter = 0;
        if (creditType === 'cash_credit') {
            balanceBefore = wallet.cashCredits;
            wallet.cashCredits = Math.max(0, wallet.cashCredits + amount);
            wallet.withdrawableCashCredits = wallet.cashCredits;
            balanceAfter = wallet.cashCredits;
        }
        else {
            balanceBefore = wallet.goodwillCredits;
            wallet.goodwillCredits = Math.max(0, wallet.goodwillCredits + amount);
            balanceAfter = wallet.goodwillCredits;
        }
        await wallet.save();
        await CreditTransaction_js_1.CreditTransaction.create({
            user: userId,
            creditType,
            transactionType: 'ADJUSTMENT',
            amount: Math.abs(amount),
            balanceBefore,
            balanceAfter,
            referenceType: 'ADMIN_ADJUSTMENT',
            referenceId: adminId.toString(),
            description: `Admin adjustment (${amount > 0 ? '+' : ''}${amount} ${creditType}): ${reason}`,
            status: 'COMPLETED',
        });
        return { balanceBefore, balanceAfter };
    }
}
exports.CreditLedgerService = CreditLedgerService;
