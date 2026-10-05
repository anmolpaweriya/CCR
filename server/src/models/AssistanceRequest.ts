import mongoose, { Document, Schema } from 'mongoose';

export type RequestStatus =
  | 'OPEN'
  | 'MATCHING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'CANCELLED'
  | 'DISPUTED';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RequestType = 'STANDARD' | 'GOODWILL';

export interface IAssistanceRequest extends Document {
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  estimatedDuration: number; // in minutes
  urgency: UrgencyLevel;
  preferredDate: string;
  preferredTime: string;
  approximateLocation: string;
  creditValue: number;
  requestType: RequestType;
  status: RequestStatus;
  requester: mongoose.Types.ObjectId;
  selectedContributor?: mongoose.Types.ObjectId;
  appliedContributors: mongoose.Types.ObjectId[];
  aiValuation?: {
    recommendedCredits: number;
    reasons: string[];
  };
  settlementId?: string;
  completionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssistanceRequestSchema = new Schema<IAssistanceRequest>(
  {
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
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    selectedContributor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    appliedContributors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    aiValuation: {
      recommendedCredits: { type: Number },
      reasons: { type: [String] },
    },
    settlementId: { type: String, unique: true, sparse: true },
    completionNotes: { type: String },
  },
  { timestamps: true }
);

export const AssistanceRequest = mongoose.model<IAssistanceRequest>(
  'AssistanceRequest',
  AssistanceRequestSchema
);
