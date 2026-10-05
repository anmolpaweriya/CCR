import mongoose, { Document, Schema } from 'mongoose';

export type ResourceRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'HANDED_OVER'
  | 'RETURN_PENDING'
  | 'RETURN_VERIFIED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface IResourceRequest extends Document {
  resource: mongoose.Types.ObjectId;
  requester: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  startDate: string;
  endDate: string;
  days: number;
  isGoodwill: boolean;
  creditsOffered: number;
  message?: string;
  status: ResourceRequestStatus;
  settlementId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceRequestSchema = new Schema<IResourceRequest>(
  {
    resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true, index: true },
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
  },
  { timestamps: true }
);

export const ResourceRequest = mongoose.model<IResourceRequest>(
  'ResourceRequest',
  ResourceRequestSchema
);
