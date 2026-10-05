import { Response, NextFunction } from 'express';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { MatchingService } from '../services/matchingService.js';
import { AuthRequest } from '../middleware/auth.js';

export class MatchingController {
  static async getMatchesForRequest(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const request = await AssistanceRequest.findById(req.params.requestId);

      if (!request) {
        res.status(404).json({ success: false, message: 'Assistance request not found' });
        return;
      }

      const matches = await MatchingService.findMatchesForRequest(request, 10);

      res.json({
        success: true,
        requestId: request._id,
        requestTitle: request.title,
        matches,
      });
    } catch (error) {
      next(error);
    }
  }
}
