"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingService = void 0;
const User_js_1 = require("../models/User.js");
class MatchingService {
    /**
     * Weights for multi-factor matching (modular and adaptable for ML)
     */
    static WEIGHTS = {
        proximity: 0.25,
        capability: 0.30,
        availability: 0.15,
        reliability: 0.20,
        suitability: 0.10,
    };
    /**
     * Find and rank matched contributors for an assistance request
     */
    static async findMatchesForRequest(request, limit = 10) {
        // Find active eligible users excluding the requester
        const candidateUsers = await User_js_1.User.find({
            _id: { $ne: request.requester },
            isSuspended: false,
        });
        const candidates = [];
        for (const user of candidateUsers) {
            const match = this.calculateMatch(request, user);
            // Only include candidates with a reasonable match score (e.g. >= 40)
            if (match.matchScore >= 35) {
                candidates.push(match);
            }
        }
        // Sort by match score descending
        candidates.sort((a, b) => b.matchScore - a.matchScore);
        return candidates.slice(0, limit);
    }
    /**
     * Calculate deterministic multi-factor match score and explainability reasons
     */
    static calculateMatch(request, user) {
        const reasons = [];
        // 1. Proximity Score (0 - 100)
        let proximityScore = 50;
        if (request.approximateLocation && user.locationZone) {
            if (request.approximateLocation.toLowerCase().includes(user.locationZone.toLowerCase()) ||
                user.locationZone.toLowerCase().includes('greenwood')) {
                proximityScore = 95;
                reasons.push(`Nearby in ${user.locationZone} (estimated < 2 km)`);
            }
            else {
                proximityScore = 65;
                reasons.push(`Within reachable community perimeter (${user.locationZone})`);
            }
        }
        // 2. Capability / Skill Score (0 - 100)
        let capabilityScore = 40;
        const requiredSkills = request.requiredSkills || [];
        const userSkills = user.skills || [];
        if (requiredSkills.length === 0) {
            capabilityScore = 85;
            reasons.push('General community assistance (no specialized skills required)');
        }
        else {
            const matchedSkills = requiredSkills.filter((reqSkill) => userSkills.some((uSkill) => uSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
                reqSkill.toLowerCase().includes(uSkill.toLowerCase())));
            if (matchedSkills.length > 0) {
                const ratio = matchedSkills.length / requiredSkills.length;
                capabilityScore = Math.round(60 + ratio * 40);
                reasons.push(`Possesses required skills: ${matchedSkills.join(', ')}`);
            }
            else {
                capabilityScore = 30;
            }
        }
        // 3. Availability Score (0 - 100)
        let availabilityScore = 70;
        if (user.availability.toLowerCase().includes('flexible')) {
            availabilityScore = 95;
            reasons.push('Flexible scheduling availability');
        }
        else if (request.preferredTime &&
            user.availability.toLowerCase().includes(request.preferredTime.toLowerCase())) {
            availabilityScore = 90;
            reasons.push(`Available during preferred time window (${user.availability})`);
        }
        else {
            availabilityScore = 60;
        }
        // 4. Reliability Score (0 - 100)
        const baseReputation = user.reputationScore || 90;
        const verificationRate = user.verificationSuccessRate || 100;
        const reliabilityScore = Math.round(baseReputation * 0.7 + verificationRate * 0.3);
        if (reliabilityScore >= 85) {
            reasons.push(`High community trust rating (${reliabilityScore}%)`);
        }
        // 5. Suitability / Experience Score (0 - 100)
        let suitabilityScore = 50;
        if (user.completedContributions >= 10) {
            suitabilityScore = 100;
            reasons.push(`Veteran contributor with ${user.completedContributions} verified contributions`);
        }
        else if (user.completedContributions >= 3) {
            suitabilityScore = 80;
            reasons.push(`Active helper with ${user.completedContributions} verified contributions`);
        }
        else {
            suitabilityScore = 60;
            reasons.push('Willing community participant');
        }
        if (user.badges && user.badges.length > 0) {
            reasons.push(`Awarded badges: ${user.badges.slice(0, 2).join(', ')}`);
        }
        // Compute composite weighted match score
        const weightedScore = proximityScore * this.WEIGHTS.proximity +
            capabilityScore * this.WEIGHTS.capability +
            availabilityScore * this.WEIGHTS.availability +
            reliabilityScore * this.WEIGHTS.reliability +
            suitabilityScore * this.WEIGHTS.suitability;
        const matchScore = Math.min(99, Math.max(20, Math.round(weightedScore)));
        return {
            user: {
                _id: user._id.toString(),
                name: user.name,
                avatar: user.avatar,
                locationZone: user.locationZone,
                reputationScore: user.reputationScore,
                completedContributions: user.completedContributions,
                badges: user.badges,
                availability: user.availability,
            },
            matchScore,
            breakdown: {
                proximityScore,
                capabilityScore,
                availabilityScore,
                reliabilityScore,
                suitabilityScore,
            },
            reasons: reasons.slice(0, 4), // Top 4 most relevant reasons
        };
    }
}
exports.MatchingService = MatchingService;
