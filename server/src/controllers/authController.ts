import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { CreditTransaction } from '../models/CreditTransaction.js';
import { ENV } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone, locationZone, skills, interests } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        return;
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'An account with this email already exists' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
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

      await Wallet.create({
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
      await CreditTransaction.create([
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

      const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
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
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase() });
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

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ id: user._id, role: user.role }, ENV.JWT_SECRET, {
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
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const wallet = await Wallet.findOne({ user: req.user._id });

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
    } catch (error) {
      next(error);
    }
  }
}
