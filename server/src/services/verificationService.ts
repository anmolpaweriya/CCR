import { AssistanceRequest } from '../models/AssistanceRequest.js';
import { ResourceRequest } from '../models/ResourceRequest.js';
import { Resource } from '../models/Resource.js';
import { Contribution } from '../models/Contribution.js';
import { GoodwillTransaction } from '../models/GoodwillTransaction.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { CreditLedgerService } from './creditLedgerService.js';

export class VerificationService {
  /**
   * Verify an assistance completion by the requester
   */
  static async verifyAssistanceCompletion(
    requestId: string,
    requesterId: string
  ): Promise<{ success: boolean; message: string }> {
    const request = await AssistanceRequest.findById(requestId);
    if (!request) {
      return { success: false, message: 'Assistance request not found' };
    }

    if (request.requester.toString() !== requesterId) {
      return { success: false, message: 'Only the original requester can verify completion' };
    }

    if (request.status === 'VERIFIED') {
      return { success: true, message: 'Contribution is already verified' };
    }

    if (!request.selectedContributor) {
      return { success: false, message: 'No contributor was selected for this request' };
    }

    const settlementId = request.settlementId || `AST-${request._id}-${Date.now()}`;
    request.settlementId = settlementId;
    request.status = 'VERIFIED';
    await request.save();

    const contributorId = request.selectedContributor.toString();
    const isGoodwill = request.requestType === 'GOODWILL';

    // Award credits to contributor
    if (isGoodwill) {
      await CreditLedgerService.awardContributionCredits(
        contributorId,
        'goodwill_credit',
        request.creditValue,
        'ASSISTANCE_REQUEST',
        request._id.toString(),
        `Earned Goodwill Credits for community assistance: "${request.title}"`,
        settlementId
      );

      // Create Goodwill Transaction record
      await GoodwillTransaction.create({
        contributor: contributorId,
        recipient: requesterId,
        itemType: 'ASSISTANCE',
        itemTitle: request.title,
        referenceId: request._id.toString(),
        goodwillCreditsAwarded: request.creditValue,
        verified: true,
        verifiedAt: new Date(),
      });
    } else {
      await CreditLedgerService.awardContributionCredits(
        contributorId,
        'cash_credit',
        request.creditValue,
        'ASSISTANCE_REQUEST',
        request._id.toString(),
        `Earned Cash Credits for assistance: "${request.title}"`,
        settlementId
      );
    }

    // Update contribution record
    await Contribution.findOneAndUpdate(
      { referenceId: request._id.toString() },
      {
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
      { upsert: true }
    );

    // Update contributor reputation and badges
    const contributor = await User.findById(contributorId);
    if (contributor) {
      contributor.completedContributions += 1;
      contributor.reputationScore = Math.min(100, contributor.reputationScore + 2);
      if (isGoodwill && !contributor.badges.includes('Goodwill Contributor')) {
        contributor.badges.push('Goodwill Contributor');
      }
      if (contributor.completedContributions >= 5 && !contributor.badges.includes('Reliable Contributor')) {
        contributor.badges.push('Reliable Contributor');
      }
      await contributor.save();
    }

    // Send notification to contributor
    await Notification.create({
      recipient: contributorId,
      title: 'Contribution Verified! 🎉',
      message: `Your help for "${request.title}" has been verified! You received +${request.creditValue} ${
        isGoodwill ? 'Goodwill' : 'Cash'
      } Credits.`,
      type: 'CREDITS_RECEIVED',
      link: '/wallet',
      metadata: { requestId: request._id, creditValue: request.creditValue, isGoodwill },
    });

    return { success: true, message: 'Assistance successfully verified and credits released!' };
  }

  /**
   * Verify resource return by the resource owner
   */
  static async verifyResourceReturn(
    resourceRequestId: string,
    ownerId: string
  ): Promise<{ success: boolean; message: string }> {
    const resRequest = await ResourceRequest.findById(resourceRequestId).populate('resource');
    if (!resRequest) {
      return { success: false, message: 'Resource request not found' };
    }

    if (resRequest.owner.toString() !== ownerId) {
      return { success: false, message: 'Only the resource owner can verify return' };
    }

    if (resRequest.status === 'RETURN_VERIFIED') {
      return { success: true, message: 'Resource return is already verified' };
    }

    const settlementId = resRequest.settlementId || `RES-${resRequest._id}-${Date.now()}`;
    resRequest.settlementId = settlementId;
    resRequest.status = 'RETURN_VERIFIED';
    await resRequest.save();

    // Mark resource as AVAILABLE again
    await Resource.findByIdAndUpdate(resRequest.resource, { status: 'AVAILABLE' });

    const resourceTitle = (resRequest.resource as any)?.name || 'Physical Resource';
    const isGoodwill = resRequest.isGoodwill;

    // Award credits to the owner (the contributor who shared their resource)
    if (isGoodwill) {
      await CreditLedgerService.awardContributionCredits(
        ownerId,
        'goodwill_credit',
        resRequest.creditsOffered,
        'RESOURCE_REQUEST',
        resRequest._id.toString(),
        `Earned Goodwill Credits for sharing resource: "${resourceTitle}"`,
        settlementId
      );

      await GoodwillTransaction.create({
        contributor: ownerId,
        recipient: resRequest.requester,
        itemType: 'RESOURCE',
        itemTitle: resourceTitle,
        referenceId: resRequest._id.toString(),
        goodwillCreditsAwarded: resRequest.creditsOffered,
        verified: true,
        verifiedAt: new Date(),
      });
    } else {
      await CreditLedgerService.awardContributionCredits(
        ownerId,
        'cash_credit',
        resRequest.creditsOffered,
        'RESOURCE_REQUEST',
        resRequest._id.toString(),
        `Earned Cash Credits for sharing resource: "${resourceTitle}"`,
        settlementId
      );
    }

    // Update contributor/owner reputation and badges
    const owner = await User.findById(ownerId);
    if (owner) {
      owner.completedContributions += 1;
      owner.reputationScore = Math.min(100, owner.reputationScore + 2);
      if (!owner.badges.includes('Resource Sharer')) {
        owner.badges.push('Resource Sharer');
      }
      if (isGoodwill && !owner.badges.includes('Goodwill Contributor')) {
        owner.badges.push('Goodwill Contributor');
      }
      await owner.save();
    }

    // Notify borrower and owner
    await Notification.create({
      recipient: ownerId,
      title: 'Resource Return Verified! 📦',
      message: `Return of "${resourceTitle}" verified. You received +${resRequest.creditsOffered} ${
        isGoodwill ? 'Goodwill' : 'Cash'
      } Credits.`,
      type: 'CREDITS_RECEIVED',
      link: '/wallet',
    });

    await Notification.create({
      recipient: resRequest.requester,
      title: 'Resource Return Confirmed! 👍',
      message: `The owner verified the safe return of "${resourceTitle}". Thank you for being a responsible community member!`,
      type: 'RESOURCE_RETURN',
      link: '/resources',
    });

    return { success: true, message: 'Resource return verified and credits distributed successfully!' };
  }
}
