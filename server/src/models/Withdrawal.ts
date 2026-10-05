import mongoose, { Document, Schema } from 'mongoose';

export type WithdrawalStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface IWithdrawal extends Document {
  user: mongoose.Types.ObjectId;
  amount: number; // Cash Credits only
  creditType: 'cash_credit';
  payoutMethod: 'UPI' | 'BANK_TRANSFER';
  payoutDetails: string;
  status: WithdrawalStatus;
  adminReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  reviewedAt?: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    creditType: { type: String, default: 'cash_credit', immutable: true },
    payoutMethod: {
      type: String,
      enum: ['UPI', 'BANK_TRANSFER'],
      default: 'UPI',
    },
    payoutDetails: { type: String, required: true },
    status: {
      type: String,
      enum: ['REQUESTED', 'PROCESSING', 'COMPLETED', 'REJECTED'],
      default: 'REQUESTED',
      index: true,
    },
    adminReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const Withdrawal = mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);
