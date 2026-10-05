import { Response, NextFunction } from 'express';
import { Resource } from '../models/Resource.js';
import { ResourceRequest } from '../models/ResourceRequest.js';
import { Notification } from '../models/Notification.js';
import { Contribution } from '../models/Contribution.js';
import { AuthRequest } from '../middleware/auth.js';
import { CreditLedgerService } from '../services/creditLedgerService.js';
import { VerificationService } from '../services/verificationService.js';

export class ResourceController {
  /**
   * Add a physical resource
   */
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const {
        name,
        description,
        category,
        images,
        condition,
        availability,
        locationZone,
        creditPrice,
        deposit,
        rules,
      } = req.body;

      if (!name || !description || !category || !creditPrice) {
        res.status(400).json({ success: false, message: 'Missing required resource fields' });
        return;
      }

      const newResource = await Resource.create({
        name,
        description,
        category,
        images: Array.isArray(images) ? images : [],
        condition: condition || 'EXCELLENT',
        availability: availability || 'IMMEDIATE',
        locationZone: locationZone || user.locationZone || 'Greenwood District',
        owner: user._id,
        creditPrice,
        deposit: deposit || 0,
        status: 'AVAILABLE',
        rules: Array.isArray(rules) && rules.length > 0 ? rules : ['Handle with care', 'Return clean and charged'],
      });

      res.status(201).json({
        success: true,
        message: 'Resource listed successfully!',
        resource: newResource,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Browse all resources
   */
  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, condition, availability, search, status } = req.query;
      const query: any = {};

      if (category && category !== 'All') query.category = category;
      if (condition && condition !== 'All') query.condition = condition;
      if (availability && availability !== 'All') query.availability = availability;
      if (status && status !== 'All') {
        query.status = status;
      } else {
        query.status = { $ne: 'UNAVAILABLE' };
      }

      if (search) {
        query.$or = [
          { name: { $regex: String(search), $options: 'i' } },
          { description: { $regex: String(search), $options: 'i' } },
          { category: { $regex: String(search), $options: 'i' } },
        ];
      }

      const resources = await Resource.find(query)
        .populate('owner', 'name avatar locationZone reputationScore badges')
        .sort({ createdAt: -1 });

      res.json({ success: true, resources });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single resource
   */
  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const resource = await Resource.findById(req.params.id).populate(
        'owner',
        'name avatar locationZone reputationScore badges completedContributions'
      );

      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      res.json({ success: true, resource });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request to borrow a resource (Standard or Goodwill)
   */
  static async requestResource(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { startDate, endDate, days, isGoodwill, message } = req.body;
      const resource = await Resource.findById(req.params.id);

      if (!resource) {
        res.status(404).json({ success: false, message: 'Resource not found' });
        return;
      }

      if (resource.owner.toString() === user._id.toString()) {
        res.status(400).json({ success: false, message: 'You cannot borrow your own resource' });
        return;
      }

      if (resource.status !== 'AVAILABLE') {
        res.status(400).json({ success: false, message: 'Resource is currently not available' });
        return;
      }

      const totalDays = Math.max(1, days || 1);
      const totalCost = resource.creditPrice * totalDays;

      // If standard, spend credits using priority logic (Goodwill first, then Cash)
      if (!isGoodwill) {
        const spendResult = await CreditLedgerService.spendCredits(
          user._id,
          totalCost,
          'RESOURCE_REQUEST',
          `RES-REQ-${Date.now()}`,
          `Escrow for borrowing: "${resource.name}" (${totalDays} day${totalDays > 1 ? 's' : ''})`,
          true
        );

        if (!spendResult.success) {
          res.status(400).json({
            success: false,
            message: spendResult.message || 'Insufficient credits to borrow this resource',
          });
          return;
        }
      }

      const resRequest = await ResourceRequest.create({
        resource: resource._id,
        requester: user._id,
        owner: resource.owner,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        days: totalDays,
        isGoodwill: !!isGoodwill,
        creditsOffered: totalCost,
        message: message || '',
        status: 'PENDING',
      });

      // Notify owner
      await Notification.create({
        recipient: resource.owner,
        title: isGoodwill ? '💚 Goodwill Opportunity' : 'New Resource Request 📦',
        message: isGoodwill
          ? `${user.name} would like to borrow your ${resource.name} as a Goodwill contribution. You will earn +${totalCost} Goodwill Credits upon verified return!`
          : `${user.name} requested to borrow your ${resource.name} for ${totalDays} day(s) (${totalCost} Credits).`,
        type: isGoodwill ? 'GOODWILL_REQUEST' : 'RESOURCE_REQUEST',
        link: `/resources/requests/${resRequest._id}`,
        metadata: {
          requestId: resRequest._id,
          resourceId: resource._id,
          isGoodwill: !!isGoodwill,
          credits: totalCost,
          borrowerName: user.name,
        },
      });

      res.status(201).json({
        success: true,
        message: isGoodwill
          ? 'Goodwill request sent to the owner!'
          : 'Borrow request submitted successfully!',
        resourceRequest: resRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Owner accepts or declines a resource request
   */
  static async handleRequestDecision(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const { decision } = req.body; // 'ACCEPT' or 'DECLINE'
      const resRequest = await ResourceRequest.findById(req.params.requestId).populate('resource');

      if (!resRequest) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }

      if (resRequest.owner.toString() !== user._id.toString()) {
        res.status(403).json({ success: false, message: 'Only the resource owner can make this decision' });
        return;
      }

      if (decision === 'ACCEPT') {
        resRequest.status = 'ACCEPTED';
        await resRequest.save();

        await Resource.findByIdAndUpdate(resRequest.resource, { status: 'RESERVED' });

        await Contribution.create({
          type: 'RESOURCE',
          referenceId: resRequest._id.toString(),
          title: `Shared ${(resRequest.resource as any)?.name || 'Resource'}`,
          contributor: user._id,
          requester: resRequest.requester,
          creditType: resRequest.isGoodwill ? 'goodwill_credit' : 'cash_credit',
          amount: resRequest.creditsOffered,
          status: 'IN_PROGRESS',
        });

        await Notification.create({
          recipient: resRequest.requester,
          title: 'Resource Request Accepted! 🎉',
          message: `${user.name} accepted your request to borrow ${(resRequest.resource as any)?.name}. Connect to arrange pickup!`,
          type: resRequest.isGoodwill ? 'GOODWILL_ACCEPTED' : 'REQUEST_ACCEPTED',
          link: `/resources`,
        });

        res.json({ success: true, message: 'Request accepted!', resourceRequest: resRequest });
      } else {
        resRequest.status = 'DECLINED';
        await resRequest.save();

        // If standard, refund credits
        if (!resRequest.isGoodwill && resRequest.creditsOffered > 0) {
          await CreditLedgerService.depositCashCredits(
            resRequest.requester,
            resRequest.creditsOffered,
            'RESOURCE_REQUEST',
            resRequest._id.toString(),
            `Refund for declined resource request: ${(resRequest.resource as any)?.name}`
          );
        }

        await Notification.create({
          recipient: resRequest.requester,
          title: 'Resource Request Update',
          message: `${user.name} was unable to accept your request at this time.`,
          type: 'RESOURCE_REQUEST',
          link: `/resources`,
        });

        res.json({ success: true, message: 'Request declined and credits refunded if applicable.' });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark handed over or returned
   */
  static async updateRequestStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      const { status } = req.body; // 'HANDED_OVER' or 'RETURN_PENDING'
      const resRequest = await ResourceRequest.findById(req.params.requestId);

      if (!resRequest) {
        res.status(404).json({ success: false, message: 'Request not found' });
        return;
      }

      if (status === 'HANDED_OVER') {
        resRequest.status = 'HANDED_OVER';
        await resRequest.save();
        await Resource.findByIdAndUpdate(resRequest.resource, { status: 'BORROWED' });

        res.json({ success: true, message: 'Resource marked as handed over', resRequest });
        return;
      }

      if (status === 'RETURN_PENDING') {
        resRequest.status = 'RETURN_PENDING';
        await resRequest.save();
        await Resource.findByIdAndUpdate(resRequest.resource, { status: 'RETURN_PENDING' });

        await Notification.create({
          recipient: resRequest.owner,
          title: 'Resource Returned — Please Verify 📦',
          message: 'The borrower marked the item as returned. Please verify safe return to finalize credits!',
          type: 'VERIFICATION_REQUIRED',
          link: `/resources`,
        });

        res.json({ success: true, message: 'Return initiated. Owner notified for verification.', resRequest });
        return;
      }

      res.status(400).json({ success: false, message: 'Invalid status' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify return by owner
   */
  static async verifyReturn(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const result = await VerificationService.verifyResourceReturn(
        String(req.params.requestId),
        user._id.toString()
      );

      if (!result.success) {
        res.status(400).json({ success: false, message: result.message });
        return;
      }

      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
}
