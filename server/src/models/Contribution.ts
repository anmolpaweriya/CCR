import mongoose, { Document, Schema } from 'mongoose';

export type ContributionType = 'ASSISTANCE' | 'RESOURCE';
export type ContributionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'DISPUTED';

export interface IContribution extends Document {
  type: ContributionType;
  referenceId: string; // ID of AssistanceRequest or ResourceRequest
  title: string;
  contributor: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  creditType: 'cash_credit' | 'goodwill_credit';
  amount: number;
  status: ContributionStatus;
  verifiedAt?: Date;
  completionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContributionSchema = new Schema<IContribution>(
  {
    type: { type: String, enum: ['ASSISTANCE', 'RESOURCE'], required: true },
    referenceId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    contributor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creditType: { type: String, enum: ['cash_credit', 'goodwill_credit'], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'DISPUTED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    verifiedAt: { type: Date },
    completionNotes: { type: String },
  },
  { timestamps: true }
);

export const Contribution = mongoose.model<IContribution>('Contribution', ContributionSchema);
