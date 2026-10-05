import mongoose, { Document, Schema } from 'mongoose';

export type DisputeStatus =
  | 'OPEN'
  | 'RESOLVED_REQUESTER'
  | 'RESOLVED_CONTRIBUTOR'
  | 'REFUNDED'
  | 'CLOSED';

export interface IDispute extends Document {
  requester: mongoose.Types.ObjectId;
  contributor: mongoose.Types.ObjectId;
  type: 'ASSISTANCE' | 'RESOURCE';
  referenceId: string;
  reason: string;
  creditAmount: number;
  creditType: 'cash_credit' | 'goodwill_credit';
  status: DisputeStatus;
  resolutionNotes?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  resolvedAt?: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contributor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['ASSISTANCE', 'RESOURCE'], required: true },
    referenceId: { type: String, required: true },
    reason: { type: String, required: true },
    creditAmount: { type: Number, required: true },
    creditType: { type: String, enum: ['cash_credit', 'goodwill_credit'], required: true },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED_REQUESTER', 'RESOLVED_CONTRIBUTOR', 'REFUNDED', 'CLOSED'],
      default: 'OPEN',
      index: true,
    },
    resolutionNotes: { type: String },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);
