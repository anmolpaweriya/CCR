import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  amount: number; // Currency in USD/DEMO units
  credits: number; // Cash Credits to award
  provider: 'DEMO_PAYMENT';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  transactionId: string;
  cardLast4?: string;
  failureReason?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    credits: { type: Number, required: true },
    provider: { type: String, default: 'DEMO_PAYMENT' },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'SUCCESS',
      index: true,
    },
    transactionId: { type: String, required: true, unique: true },
    cardLast4: { type: String, default: '4242' },
    failureReason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
