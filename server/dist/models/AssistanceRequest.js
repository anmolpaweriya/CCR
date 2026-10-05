"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssistanceRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AssistanceRequestSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: [
            'Home Improvement',
            'Moving & Lifting',
            'Tech & Digital',
            'Errands & Delivery',
            'Gardening & Outdoor',
            'Tutoring & Skills',
            'Pet Care',
            'Other',
        ],
        default: 'Home Improvement',
    },
    requiredSkills: { type: [String], default: [] },
    estimatedDuration: { type: Number, required: true, default: 60 },
    urgency: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM',
    },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    approximateLocation: { type: String, required: true, default: 'Within 2 km' },
    creditValue: { type: Number, required: true, min: 1 },
    requestType: {
        type: String,
        enum: ['STANDARD', 'GOODWILL'],
        default: 'STANDARD',
    },
    status: {
        type: String,
        enum: [
            'OPEN',
            'MATCHING',
            'ACCEPTED',
            'IN_PROGRESS',
            'COMPLETED',
            'VERIFICATION_PENDING',
            'VERIFIED',
            'CANCELLED',
            'DISPUTED',
        ],
        default: 'OPEN',
        index: true,
    },
    requester: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    selectedContributor: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    appliedContributors: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    aiValuation: {
        recommendedCredits: { type: Number },
        reasons: { type: [String] },
    },
    settlementId: { type: String, unique: true, sparse: true },
    completionNotes: { type: String },
}, { timestamps: true });
exports.AssistanceRequest = mongoose_1.default.model('AssistanceRequest', AssistanceRequestSchema);
