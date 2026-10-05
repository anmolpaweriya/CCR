import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { AuthRequest } from '../middleware/auth.js';

export class UserController {
  /**
   * Update current user's profile
   */
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { name, phone, locationZone, skills, interests, availability, avatar } = req.body;

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(locationZone && { locationZone }),
          ...(skills && { skills: Array.isArray(skills) ? skills : [] }),
          ...(interests && { interests: Array.isArray(interests) ? interests : [] }),
          ...(availability && { availability }),
          ...(avatar && { avatar }),
        },
        { new: true }
      ).select('-passwordHash');

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get public profile with reputation and reviews
   */
  static async getPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await User.findById(req.params.id)
        .select('-passwordHash -phone -email')
        .lean();

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const reviews = await Review.find({ targetUser: req.params.id })
        .populate('reviewer', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        success: true,
        user,
        reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get community leaders & active contributors
   */
  static async getCommunityHelpers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const helpers = await User.find({ isSuspended: false })
        .select('name avatar locationZone reputationScore completedContributions badges availability skills')
        .sort({ completedContributions: -1, reputationScore: -1 })
        .limit(12);

      res.json({ success: true, helpers });
    } catch (error) {
      next(error);
    }
  }
}
