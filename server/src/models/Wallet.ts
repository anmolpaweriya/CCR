import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  cashCredits: number;
  goodwillCredits: number;
  totalCashEarned: number;
  totalCashSpent: number;
  totalGoodwillEarned: number;
  totalGoodwillSpent: number;
  pendingCashCredits: number;
  withdrawableCashCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    cashCredits: { type: Number, default: 0, min: 0 },
    goodwillCredits: { type: Number, default: 0, min: 0 },
    totalCashEarned: { type: Number, default: 0, min: 0 },
    totalCashSpent: { type: Number, default: 0, min: 0 },
    totalGoodwillEarned: { type: Number, default: 0, min: 0 },
    totalGoodwillSpent: { type: Number, default: 0, min: 0 },
    pendingCashCredits: { type: Number, default: 0, min: 0 },
    withdrawableCashCredits: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Wallet = mongoose.model<IWallet>('Wallet', WalletSchema);
