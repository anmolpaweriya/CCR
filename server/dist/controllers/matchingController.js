"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingController = void 0;
const AssistanceRequest_js_1 = require("../models/AssistanceRequest.js");
const matchingService_js_1 = require("../services/matchingService.js");
class MatchingController {
    static async getMatchesForRequest(req, res, next) {
        try {
            const request = await AssistanceRequest_js_1.AssistanceRequest.findById(req.params.requestId);
            if (!request) {
                res.status(404).json({ success: false, message: 'Assistance request not found' });
                return;
            }
            const matches = await matchingService_js_1.MatchingService.findMatchesForRequest(request, 10);
            res.json({
                success: true,
                requestId: request._id,
                requestTitle: request.title,
                matches,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MatchingController = MatchingController;
