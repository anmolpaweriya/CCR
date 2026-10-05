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
exports.Resource = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ResourceSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: [
            'Tools & Hardware',
            'Electronics & Audio',
            'Outdoor & Camping',
            'Bicycles & Mobility',
            'Appliances & Home',
            'Books & Media',
            'Other',
        ],
        default: 'Tools & Hardware',
    },
    images: { type: [String], default: [] },
    condition: {
        type: String,
        enum: ['LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR'],
        default: 'EXCELLENT',
    },
    availability: {
        type: String,
        enum: ['IMMEDIATE', 'WEEKDAYS', 'WEEKENDS', 'UPON_REQUEST'],
        default: 'IMMEDIATE',
    },
    locationZone: { type: String, required: true, default: 'Greenwood District' },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creditPrice: { type: Number, required: true, min: 1 },
    deposit: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['AVAILABLE', 'RESERVED', 'BORROWED', 'RETURN_PENDING', 'RETURNED', 'UNAVAILABLE'],
        default: 'AVAILABLE',
        index: true,
    },
    rules: { type: [String], default: ['Handle with care', 'Return clean and charged/tested'] },
}, { timestamps: true });
exports.Resource = mongoose_1.default.model('Resource', ResourceSchema);
