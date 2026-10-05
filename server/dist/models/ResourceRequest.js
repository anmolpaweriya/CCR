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
exports.ResourceRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ResourceRequestSchema = new mongoose_1.Schema({
    resource: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
    requester: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    days: { type: Number, required: true, default: 1 },
    isGoodwill: { type: Boolean, default: false },
    creditsOffered: { type: Number, required: true, min: 0 },
    message: { type: String, default: '' },
    status: {
        type: String,
        enum: [
            'PENDING',
            'ACCEPTED',
            'DECLINED',
            'HANDED_OVER',
            'RETURN_PENDING',
            'RETURN_VERIFIED',
            'CANCELLED',
            'DISPUTED',
        ],
        default: 'PENDING',
        index: true,
    },
    settlementId: { type: String, unique: true, sparse: true },
}, { timestamps: true });
exports.ResourceRequest = mongoose_1.default.model('ResourceRequest', ResourceRequestSchema);
