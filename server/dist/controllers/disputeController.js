"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeController = void 0;
const Dispute_js_1 = require("../models/Dispute.js");
const AssistanceRequest_js_1 = require("../models/AssistanceRequest.js");
const ResourceRequest_js_1 = require("../models/ResourceRequest.js");
const Notification_js_1 = require("../models/Notification.js");
class DisputeController {
    static async create(req, res, next) {
        try {
            const user = req.user;
            const { type, referenceId, reason } = req.body;
            if (!type || !referenceId || !reason) {
                res.status(400).json({ success: false, message: 'Type, referenceId, and reason are required' });
                return;
            }
            let creditAmount = 0;
            let creditType = 'cash_credit';
            let contributorId = '';
            if (type === 'ASSISTANCE') {
                const ast = await AssistanceRequest_js_1.AssistanceRequest.findById(referenceId);
                if (!ast) {
                    res.status(404).json({ success: false, message: 'Assistance request not found' });
                    return;
                }
                creditAmount = ast.creditValue;
                creditType = ast.requestType === 'GOODWILL' ? 'goodwill_credit' : 'cash_credit';
                contributorId = ast.selectedContributor?.toString() || '';
                ast.status = 'DISPUTED';
                await ast.save();
            }
            else {
                const resReq = await ResourceRequest_js_1.ResourceRequest.findById(referenceId);
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
            const dispute = await Dispute_js_1.Dispute.create({
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
                await Notification_js_1.Notification.create({
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
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyDisputes(req, res, next) {
        try {
            const user = req.user;
            const disputes = await Dispute_js_1.Dispute.find({
                $or: [{ requester: user._id }, { contributor: user._id }],
            })
                .populate('requester', 'name avatar')
                .populate('contributor', 'name avatar')
                .sort({ createdAt: -1 });
            res.json({ success: true, disputes });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DisputeController = DisputeController;
