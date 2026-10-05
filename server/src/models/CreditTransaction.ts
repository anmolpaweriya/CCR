import mongoose, { Document, Schema } from 'mongoose';

export type CreditType = 'cash_credit' | 'goodwill_credit';

export type TransactionType =
  | 'TOPUP'
  | 'WITHDRAWAL'
  | 'ASSISTANCE_PAYMENT'
  | 'ASSISTANCE_EARNING'
  | 'RESOURCE_PAYMENT'
  | 'RESOURCE_EARNING'
  | 'GOODWILL_REWARD'
  | 'REFUND'
  | 'ADJUSTMENT';

export type ReferenceType =
  | 'PAYMENT'
  | 'WITHDRAWAL'
  | 'ASSISTANCE_REQUEST'
  | 'RESOURCE_REQUEST'
  | 'ADMIN_ADJUSTMENT'
  | 'WELCOME_BONUS';

export interface ICreditTransaction extends Document {
  user: mongoose.Types.ObjectId;
  creditType: CreditType;
  transactionType: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: ReferenceType;
  referenceId: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REVERTED';
  createdAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creditType: { type: String, enum: ['cash_credit', 'goodwill_credit'], required: true },
    transactionType: {
      type: String,
      enum: [
        'TOPUP',
        'WITHDRAWAL',
        'ASSISTANCE_PAYMENT',
        'ASSISTANCE_EARNING',
        'RESOURCE_PAYMENT',
        'RESOURCE_EARNING',
        'GOODWILL_REWARD',
        'REFUND',
        'ADJUSTMENT',
      ],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceType: {
      type: String,
      enum: [
        'PAYMENT',
        'WITHDRAWAL',
        'ASSISTANCE_REQUEST',
        'RESOURCE_REQUEST',
        'ADMIN_ADJUSTMENT',
        'WELCOME_BONUS',
      ],
      required: true,
    },
    referenceId: { type: String, required: true, index: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED', 'REVERTED'],
      default: 'COMPLETED',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const CreditTransaction = mongoose.model<ICreditTransaction>(
  'CreditTransaction',
  CreditTransactionSchema
);
