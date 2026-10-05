import { Response, NextFunction } from 'express';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { Notification } from '../models/Notification.js';
import { Contribution } from '../models/Contribution.js';
import { AuthRequest } from '../middleware/auth.js';
import { CreditLedgerService } from '../services/creditLedgerService.js';
import { ValuationService } from '../services/valuationService.js';
import { VerificationService } from '../services/verificationService.js';

export class AssistanceController {
  /**
   * Create an assistance request
   */
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const {
        title,
        description,
        category,
        requiredSkills,
        estimatedDuration,
        urgency,
        preferredDate,
        preferredTime,
        approximateLocation,
        creditValue,
        requestType,
      } = req.body;

      if (!title || !description || !category || !preferredDate || !preferredTime) {
        res.status(400).json({ success: false, message: 'Missing required fields' });
        return;
      }

      // Calculate valuation
      const valuation = ValuationService.evaluateAssistance({
        category,
        estimatedDuration: estimatedDuration || 60,
        urgency: urgency || 'MEDIUM',
        requiredSkills: requiredSkills || [],
      });

      const finalCreditValue = creditValue || valuation.recommendedCredits;
      const isGoodwill = requestType === 'GOODWILL';

      // If standard request, spend credits using priority logic (Goodwill first, then Cash)
      if (!isGoodwill) {
        const spendResult = await CreditLedgerService.spendCredits(
          user._id,
          finalCreditValue,
          'ASSISTANCE_REQUEST',
          `REQ-INIT-${Date.now()}`,
          `Escrow for assistance request: "${title}"`,
          true // allow spending Goodwill Credits first!
        );

        if (!spendResult.success) {
          res.status(400).json({
            success: false,
            message: spendResult.message || 'Insufficient credits to create request',
          });
          return;
        }
      }

      const newRequest = await AssistanceRequest.create({
        title,
        description,
        category,
        requiredSkills: requiredSkills || [],
        estimatedDuration: estimatedDuration || 60,
        urgency: urgency || 'MEDIUM',
        preferredDate,
        preferredTime,
        approximateLocation: approximateLocation || user.locationZone || 'Greenwood District',
        creditValue: finalCreditValue,
        requestType: isGoodwill ? 'GOODWILL' : 'STANDARD',
        status: 'OPEN',
        requester: user._id,
        aiValuation: {
          recommendedCredits: valuation.recommendedCredits,
          reasons: valuation.reasons,
        },
      });

      res.status(201).json({
        success: true,
        message: isGoodwill
          ? 'Goodwill assistance request published to community!'
          : 'Assistance request created successfully!',
        request: newRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Browse assistance requests
   */
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, urgency, status, search, requestType } = req.query;
      const query: any = {};

      if (category && category !== 'All') query.category = category;
      if (urgency && urgency !== 'All') query.urgency = urgency;
      if (status && status !== 'All') query.status = status;
      if (requestType && requestType !== 'All') query.requestType = requestType;
      if (search) {
        query.$or = [
          { title: { $regex: String(search), $options: 'i' } },
          { description: { $regex: String(search), $options: 'i' } },
          { requiredSkills: { $regex: String(search), $options: 'i' } },
        ];
      }

      const requests = await AssistanceRequest.find(query)
        .populate('requester', 'name avatar locationZone reputationScore badges')
        .populate('selectedContributor', 'name avatar locationZone reputationScore')
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({ success: true, requests });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single request details
   */
  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = await AssistanceRequest.findById(req.params.id)
        .populate('requester', 'name avatar locationZone reputationScore badges completedContributions')
        .populate('selectedContributor', 'name avatar locationZone reputationScore badges')
        .populate('appliedContributors', 'name avatar locationZone reputationScore badges');

      if (!request) {
        res.status(404).json({ success: false, message: 'Assistance request not found' });
        return;
      }

      res.json({ success: true, request });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Contributor volunteers / applies to help
   */
  static async apply(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const request = await AssistanceRequest.findById(req.params.id);

      if (!request) {
        res.status(404).json({ success: false, message: 'Assistance request not found' });
        return;
      }

      if (request.requester.toString() === user._id.toString()) {
        res.status(400).json({ success: false, message: 'You cannot volunteer for your own request' });
        return;
      }

      if (request.status !== 'OPEN') {
        res.status(400).json({ success: false, message: 'This request is no longer accepting volunteers' });
        return;
      }

      const alreadyApplied = request.appliedContributors.some(
        (id) => id.toString() === user._id.toString()
      );

      if (!alreadyApplied) {
        request.appliedContributors.push(user._id);
        await request.save();

        await Notification.create({
          recipient: request.requester,
          title: 'New Volunteer Offer! 🤝',
          message: `${user.name} has offered to help with "${request.title}".`,
          type: 'MATCH_FOUND',
          link: `/assistance/${request._id}`,
          metadata: { requestId: request._id, contributorId: user._id },
        });
      }

      res.json({ success: true, message: 'You have offered your assistance!' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Requester selects / accepts a contributor
   */
  static async selectContributor(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { contributorId } = req.body;
      const request = await AssistanceRequest.findById(req.params.id);

      if (!request) {
        res.status(404).json({ success: false, message: 'Assistance request not found' });
        return;
      }

      if (request.requester.toString() !== user._id.toString()) {
        res.status(403).json({ success: false, message: 'Only the requester can select a contributor' });
        return;
      }

      request.selectedContributor = contributorId;
      request.status = 'ACCEPTED';
      await request.save();

      // Create initial Contribution record
      await Contribution.create({
        type: 'ASSISTANCE',
        referenceId: request._id.toString(),
        title: request.title,
        contributor: contributorId,
        requester: user._id,
        creditType: request.requestType === 'GOODWILL' ? 'goodwill_credit' : 'cash_credit',
        amount: request.creditValue,
        status: 'IN_PROGRESS',
      });

      await Notification.create({
        recipient: contributorId,
        title: 'You were selected to help! 🎯',
        message: `${user.name} selected you to help with "${request.title}".`,
        type: 'REQUEST_ACCEPTED',
        link: `/assistance/${request._id}`,
        metadata: { requestId: request._id },
      });

      res.json({ success: true, message: 'Contributor selected successfully!', request });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Contributor or Requester updates progress: IN_PROGRESS or COMPLETED
   */
  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { status, completionNotes } = req.body;
      const request = await AssistanceRequest.findById(req.params.id);

      if (!request) {
        res.status(404).json({ success: false, message: 'Assistance request not found' });
        return;
      }

      const isRequester = request.requester.toString() === user._id.toString();
      const isContributor = request.selectedContributor?.toString() === user._id.toString();

      if (!isRequester && !isContributor) {
        res.status(403).json({ success: false, message: 'Not authorized to update this request' });
        return;
      }

      if (status === 'COMPLETED' && isContributor) {
        request.status = 'VERIFICATION_PENDING';
        request.completionNotes = completionNotes || 'Marked completed by contributor';
        await request.save();

        await Contribution.findOneAndUpdate(
          { referenceId: request._id.toString() },
          { status: 'COMPLETED', completionNotes: request.completionNotes }
        );

        await Notification.create({
          recipient: request.requester,
          title: 'Assistance Completed — Verification Needed 🔍',
          message: `${user.name} marked "${request.title}" as completed. Please verify to release credits!`,
          type: 'VERIFICATION_REQUIRED',
          link: `/assistance/${request._id}`,
          metadata: { requestId: request._id },
        });

        res.json({
          success: true,
          message: 'Task marked as completed! Requester has been notified for verification.',
          request,
        });
        return;
      }

      if (status === 'IN_PROGRESS') {
        request.status = 'IN_PROGRESS';
        await request.save();
        res.json({ success: true, message: 'Status updated to in-progress', request });
        return;
      }

      res.status(400).json({ success: false, message: 'Invalid status transition' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Requester verifies completion -> Releases credits
   */
  static async verify(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const result = await VerificationService.verifyAssistanceCompletion(
        String(req.params.id),
        user._id.toString()
      );

      if (!result.success) {
        res.status(400).json({ success: false, message: result.message });
        return;
      }

      const updatedRequest = await AssistanceRequest.findById(req.params.id)
        .populate('requester', 'name avatar locationZone')
        .populate('selectedContributor', 'name avatar locationZone');

      res.json({ success: true, message: result.message, request: updatedRequest });
    } catch (error) {
      next(error);
    }
  }
}
