import { Response, NextFunction } from 'express';
import { Dispute } from '../models/Dispute.js';
import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { ResourceRequest } from '../models/ResourceRequest.js';
import { Notification } from '../models/Notification.js';
import { AuthRequest } from '../middleware/auth.js';

export class DisputeController {
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const { type, referenceId, reason } = req.body;

      if (!type || !referenceId || !reason) {
        res.status(400).json({ success: false, message: 'Type, referenceId, and reason are required' });
        return;
      }

      let creditAmount = 0;
      let creditType: 'cash_credit' | 'goodwill_credit' = 'cash_credit';
      let contributorId = '';

      if (type === 'ASSISTANCE') {
        const ast = await AssistanceRequest.findById(referenceId);
        if (!ast) {
          res.status(404).json({ success: false, message: 'Assistance request not found' });
          return;
        }
        creditAmount = ast.creditValue;
        creditType = ast.requestType === 'GOODWILL' ? 'goodwill_credit' : 'cash_credit';
        contributorId = ast.selectedContributor?.toString() || '';
        ast.status = 'DISPUTED';
        await ast.save();
      } else {
        const resReq = await ResourceRequest.findById(referenceId);
        if (!resReq) {
          res.status(404).json({ success: false, message: 'Resource request not found' });
          return;
        }
        creditAmount = resReq.creditsOffered;
        creditType = resReq.isGoodwill ? 'goodwill_credit' : 'cash_credit';
        contributorId = resReq.owner.toString();
        resReq.status = 'DISPUTED';
        await resReq.save();
      }

      const dispute = await Dispute.create({
        requester: user._id,
        contributor: contributorId || user._id,
        type,
        referenceId,
        reason,
        creditAmount,
        creditType,
        status: 'OPEN',
      });

      // Notify contributor
      if (contributorId && contributorId !== user._id.toString()) {
        await Notification.create({
          recipient: contributorId,
          title: 'Dispute Raised ⚠️',
          message: `A dispute has been raised regarding your ${type.toLowerCase()} contribution. An administrator will review it.`,
          type: 'DISPUTE_UPDATE',
          link: '/disputes',
        });
      }

      res.status(201).json({
        success: true,
        message: 'Dispute submitted successfully. Admin review is pending.',
        dispute,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyDisputes(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user!;
      const disputes = await Dispute.find({
        $or: [{ requester: user._id }, { contributor: user._id }],
      })
        .populate('requester', 'name avatar')
        .populate('contributor', 'name avatar')
        .sort({ createdAt: -1 });

      res.json({ success: true, disputes });
    } catch (error) {
      next(error);
    }
  }
}
