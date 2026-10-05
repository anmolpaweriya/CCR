"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const AssistanceRequest_js_1 = require("../models/AssistanceRequest.js");
const ResourceRequest_js_1 = require("../models/ResourceRequest.js");
const Resource_js_1 = require("../models/Resource.js");
const Contribution_js_1 = require("../models/Contribution.js");
const GoodwillTransaction_js_1 = require("../models/GoodwillTransaction.js");
const Notification_js_1 = require("../models/Notification.js");
const User_js_1 = require("../models/User.js");
const creditLedgerService_js_1 = require("./creditLedgerService.js");
class VerificationService {
    /**
     * Verify an assistance completion by the requester
     */
    static async verifyAssistanceCompletion(requestId, requesterId) {
        const request = await AssistanceRequest_js_1.AssistanceRequest.findById(requestId);
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
            await creditLedgerService_js_1.CreditLedgerService.awardContributionCredits(contributorId, 'goodwill_credit', request.creditValue, 'ASSISTANCE_REQUEST', request._id.toString(), `Earned Goodwill Credits for community assistance: "${request.title}"`, settlementId);
            // Create Goodwill Transaction record
            await GoodwillTransaction_js_1.GoodwillTransaction.create({
                contributor: contributorId,
                recipient: requesterId,
                itemType: 'ASSISTANCE',
                itemTitle: request.title,
                referenceId: request._id.toString(),
                goodwillCreditsAwarded: request.creditValue,
                verified: true,
                verifiedAt: new Date(),
            });
        }
        else {
            await creditLedgerService_js_1.CreditLedgerService.awardContributionCredits(contributorId, 'cash_credit', request.creditValue, 'ASSISTANCE_REQUEST', request._id.toString(), `Earned Cash Credits for assistance: "${request.title}"`, settlementId);
        }
        // Update contribution record
        await Contribution_js_1.Contribution.findOneAndUpdate({ referenceId: request._id.toString() }, {
            status: 'VERIFIED',
            verifiedAt: new Date(),
        }, { upsert: true });
        // Update contributor reputation and badges
        const contributor = await User_js_1.User.findById(contributorId);
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
        await Notification_js_1.Notification.create({
            recipient: contributorId,
            title: 'Contribution Verified! 🎉',
            message: `Your help for "${request.title}" has been verified! You received +${request.creditValue} ${isGoodwill ? 'Goodwill' : 'Cash'} Credits.`,
            type: 'CREDITS_RECEIVED',
            link: '/wallet',
            metadata: { requestId: request._id, creditValue: request.creditValue, isGoodwill },
        });
        return { success: true, message: 'Assistance successfully verified and credits released!' };
    }
    /**
     * Verify resource return by the resource owner
     */
    static async verifyResourceReturn(resourceRequestId, ownerId) {
        const resRequest = await ResourceRequest_js_1.ResourceRequest.findById(resourceRequestId).populate('resource');
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
        await Resource_js_1.Resource.findByIdAndUpdate(resRequest.resource, { status: 'AVAILABLE' });
        const resourceTitle = resRequest.resource?.name || 'Physical Resource';
        const isGoodwill = resRequest.isGoodwill;
        // Award credits to the owner (the contributor who shared their resource)
        if (isGoodwill) {
            await creditLedgerService_js_1.CreditLedgerService.awardContributionCredits(ownerId, 'goodwill_credit', resRequest.creditsOffered, 'RESOURCE_REQUEST', resRequest._id.toString(), `Earned Goodwill Credits for sharing resource: "${resourceTitle}"`, settlementId);
            await GoodwillTransaction_js_1.GoodwillTransaction.create({
                contributor: ownerId,
                recipient: resRequest.requester,
                itemType: 'RESOURCE',
                itemTitle: resourceTitle,
                referenceId: resRequest._id.toString(),
                goodwillCreditsAwarded: resRequest.creditsOffered,
                verified: true,
                verifiedAt: new Date(),
            });
        }
        else {
            await creditLedgerService_js_1.CreditLedgerService.awardContributionCredits(ownerId, 'cash_credit', resRequest.creditsOffered, 'RESOURCE_REQUEST', resRequest._id.toString(), `Earned Cash Credits for sharing resource: "${resourceTitle}"`, settlementId);
        }
        // Update contributor/owner reputation and badges
        const owner = await User_js_1.User.findById(ownerId);
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
        await Notification_js_1.Notification.create({
            recipient: ownerId,
            title: 'Resource Return Verified! 📦',
            message: `Return of "${resourceTitle}" verified. You received +${resRequest.creditsOffered} ${isGoodwill ? 'Goodwill' : 'Cash'} Credits.`,
            type: 'CREDITS_RECEIVED',
            link: '/wallet',
        });
        await Notification_js_1.Notification.create({
            recipient: resRequest.requester,
            title: 'Resource Return Confirmed! 👍',
            message: `The owner verified the safe return of "${resourceTitle}". Thank you for being a responsible community member!`,
            type: 'RESOURCE_RETURN',
            link: '/resources',
        });
        return { success: true, message: 'Resource return verified and credits distributed successfully!' };
    }
}
exports.VerificationService = VerificationService;
