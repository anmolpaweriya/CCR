"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValuationController = void 0;
const valuationService_js_1 = require("../services/valuationService.js");
class ValuationController {
    static async evaluateAssistance(req, res, next) {
        try {
            const { category, estimatedDuration, urgency, requiredSkills } = req.body;
            const valuation = valuationService_js_1.ValuationService.evaluateAssistance({
                category: category || 'Home Improvement',
                estimatedDuration: estimatedDuration || 60,
                urgency: urgency || 'MEDIUM',
                requiredSkills: requiredSkills || [],
            });
            res.json({
                success: true,
                valuation,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async evaluateResource(req, res, next) {
        try {
            const { category, condition } = req.body;
            const valuation = valuationService_js_1.ValuationService.evaluateResource(category || 'Tools & Hardware', condition || 'EXCELLENT');
            res.json({
                success: true,
                valuation,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ValuationController = ValuationController;
