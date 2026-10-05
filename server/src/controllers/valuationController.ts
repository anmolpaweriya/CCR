import { Response, NextFunction } from 'express';
import { ValuationService } from '../services/valuationService.js';
import { AuthRequest } from '../middleware/auth.js';

export class ValuationController {
  static async evaluateAssistance(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { category, estimatedDuration, urgency, requiredSkills } = req.body;

      const valuation = ValuationService.evaluateAssistance({
        category: category || 'Home Improvement',
        estimatedDuration: estimatedDuration || 60,
        urgency: urgency || 'MEDIUM',
        requiredSkills: requiredSkills || [],
      });

      res.json({
        success: true,
        valuation,
      });
    } catch (error) {
      next(error);
    }
  }

  static async evaluateResource(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { category, condition } = req.body;

      const valuation = ValuationService.evaluateResource(
        category || 'Tools & Hardware',
        condition || 'EXCELLENT'
      );

      res.json({
        success: true,
        valuation,
      });
    } catch (error) {
      next(error);
    }
  }
}
