import { Response, NextFunction } from 'express';
import { GoodwillTransaction } from '../models/GoodwillTransaction.js';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { Resource } from '../models/Resource.js';
import { AuthRequest } from '../middleware/auth.js';

export class GoodwillController {
  /**
   * Get active goodwill opportunities in the community
   */
  static async getOpportunities(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Assistance requests looking for goodwill help
      const goodwillRequests = await AssistanceRequest.find({
        requestType: 'GOODWILL',
        status: 'OPEN',
      })
        .populate('requester', 'name avatar locationZone reputationScore badges')
        .sort({ createdAt: -1 })
        .limit(10);

      // Shared resources that are available
      const goodwillResources = await Resource.find({
        status: 'AVAILABLE',
      })
        .populate('owner', 'name avatar locationZone reputationScore badges')
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        success: true,
        opportunities: {
          assistance: goodwillRequests,
          resources: goodwillResources,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's goodwill transactions history
   */
  static async getMyHistory(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const transactions = await GoodwillTransaction.find({
        $or: [{ contributor: user._id }, { recipient: user._id }],
      })
        .populate('contributor', 'name avatar')
        .populate('recipient', 'name avatar')
        .sort({ createdAt: -1 });

      res.json({ success: true, transactions });
    } catch (error) {
      next(error);
    }
  }
}
