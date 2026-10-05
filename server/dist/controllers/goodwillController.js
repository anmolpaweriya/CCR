"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodwillController = void 0;
const GoodwillTransaction_js_1 = require("../models/GoodwillTransaction.js");
const AssistanceRequest_js_1 = require("../models/AssistanceRequest.js");
const Resource_js_1 = require("../models/Resource.js");
class GoodwillController {
    /**
     * Get active goodwill opportunities in the community
     */
    static async getOpportunities(req, res, next) {
        try {
            // Assistance requests looking for goodwill help
            const goodwillRequests = await AssistanceRequest_js_1.AssistanceRequest.find({
                requestType: 'GOODWILL',
                status: 'OPEN',
            })
                .populate('requester', 'name avatar locationZone reputationScore badges')
                .sort({ createdAt: -1 })
                .limit(10);
            // Shared resources that are available
            const goodwillResources = await Resource_js_1.Resource.find({
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
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get user's goodwill transactions history
     */
    static async getMyHistory(req, res, next) {
        try {
            const user = req.user;
            const transactions = await GoodwillTransaction_js_1.GoodwillTransaction.find({
                $or: [{ contributor: user._id }, { recipient: user._id }],
            })
                .populate('contributor', 'name avatar')
                .populate('recipient', 'name avatar')
                .sort({ createdAt: -1 });
            res.json({ success: true, transactions });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GoodwillController = GoodwillController;
