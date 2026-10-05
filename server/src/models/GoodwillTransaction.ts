import mongoose, { Document, Schema } from 'mongoose';

export interface IGoodwillTransaction extends Document {
  contributor: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  itemType: 'ASSISTANCE' | 'RESOURCE';
  itemTitle: string;
  referenceId: string;
  goodwillCreditsAwarded: number;
  verified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

const GoodwillTransactionSchema = new Schema<IGoodwillTransaction>(
  {
    contributor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: { type: String, enum: ['ASSISTANCE', 'RESOURCE'], required: true },
    itemTitle: { type: String, required: true },
    referenceId: { type: String, required: true, index: true },
    goodwillCreditsAwarded: { type: Number, required: true, min: 1 },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const GoodwillTransaction = mongoose.model<IGoodwillTransaction>(
  'GoodwillTransaction',
  GoodwillTransactionSchema
);
