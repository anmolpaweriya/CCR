"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = require("../models/User.js");
const Wallet_js_1 = require("../models/Wallet.js");
const CreditTransaction_js_1 = require("../models/CreditTransaction.js");
const env_js_1 = require("../config/env.js");
class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password, phone, locationZone, skills, interests } = req.body;
            if (!name || !email || !password) {
                res.status(400).json({ success: false, message: 'Name, email, and password are required' });
                return;
            }
            const existingUser = await User_js_1.User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                res.status(409).json({ success: false, message: 'An account with this email already exists' });
                return;
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const passwordHash = await bcryptjs_1.default.hash(password, salt);
            const user = await User_js_1.User.create({
                name,
                email: email.toLowerCase(),
                phone,
                passwordHash,
                role: 'USER',
                locationZone: locationZone || 'Greenwood District',
                skills: Array.isArray(skills) ? skills : [],
                interests: Array.isArray(interests) ? interests : [],
                badges: ['Community Helper'],
            });
            // Welcome bonus: 50 Cash Credits, 20 Goodwill Credits to immediately test interactions
            const initialCash = 50;
            const initialGoodwill = 20;
            await Wallet_js_1.Wallet.create({
                user: user._id,
                cashCredits: initialCash,
                goodwillCredits: initialGoodwill,
                totalCashEarned: initialCash,
                totalCashSpent: 0,
                totalGoodwillEarned: initialGoodwill,
                totalGoodwillSpent: 0,
                pendingCashCredits: 0,
                withdrawableCashCredits: initialCash,
            });
            // Log welcome bonus in ledger
            await CreditTransaction_js_1.CreditTransaction.create([
                {
                    user: user._id,
                    creditType: 'cash_credit',
                    transactionType: 'TOPUP',
                    amount: initialCash,
                    balanceBefore: 0,
                    balanceAfter: initialCash,
                    referenceType: 'WELCOME_BONUS',
                    referenceId: `WELCOME-CASH-${user._id}`,
                    description: 'Welcome to CCR! Starter Cash Credits bonus',
                    status: 'COMPLETED',
                },
                {
                    user: user._id,
                    creditType: 'goodwill_credit',
                    transactionType: 'GOODWILL_REWARD',
                    amount: initialGoodwill,
                    balanceBefore: 0,
                    balanceAfter: initialGoodwill,
                    referenceType: 'WELCOME_BONUS',
                    referenceId: `WELCOME-GW-${user._id}`,
                    description: 'Welcome to CCR! Starter Goodwill Credits bonus',
                    status: 'COMPLETED',
                },
            ]);
            const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_js_1.ENV.JWT_SECRET, {
                expiresIn: '7d',
            });
            res.status(201).json({
                success: true,
                message: 'Registration successful! Welcome bonus credited.',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    locationZone: user.locationZone,
                    badges: user.badges,
                    reputationScore: user.reputationScore,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ success: false, message: 'Email and password are required' });
                return;
            }
            const user = await User_js_1.User.findOne({ email: email.toLowerCase() });
            if (!user) {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
                return;
            }
            if (user.isSuspended) {
                res.status(403).json({
                    success: false,
                    message: 'Account has been suspended. Please contact platform administrators.',
                });
                return;
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isMatch) {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
                return;
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_js_1.ENV.JWT_SECRET, {
                expiresIn: '7d',
            });
            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    locationZone: user.locationZone,
                    badges: user.badges,
                    reputationScore: user.reputationScore,
                    skills: user.skills,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMe(req, res, next) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Not authenticated' });
                return;
            }
            const wallet = await Wallet_js_1.Wallet.findOne({ user: req.user._id });
            res.json({
                success: true,
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                    phone: req.user.phone,
                    role: req.user.role,
                    locationZone: req.user.locationZone,
                    skills: req.user.skills,
                    interests: req.user.interests,
                    availability: req.user.availability,
                    reputationScore: req.user.reputationScore,
                    completedContributions: req.user.completedContributions,
                    badges: req.user.badges,
                    isVerified: req.user.isVerified,
                },
                wallet: wallet
                    ? {
                        cashCredits: wallet.cashCredits,
                        goodwillCredits: wallet.goodwillCredits,
                        withdrawableCashCredits: wallet.withdrawableCashCredits,
                        pendingCashCredits: wallet.pendingCashCredits,
                        totalCashEarned: wallet.totalCashEarned,
                        totalCashSpent: wallet.totalCashSpent,
                        totalGoodwillEarned: wallet.totalGoodwillEarned,
                        totalGoodwillSpent: wallet.totalGoodwillSpent,
                    }
                    : null,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
