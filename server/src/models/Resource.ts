import mongoose, { Document, Schema } from 'mongoose';

export type ResourceCondition = 'LIKE_NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR';
export type ResourceAvailability = 'IMMEDIATE' | 'WEEKDAYS' | 'WEEKENDS' | 'UPON_REQUEST';
export type ResourceStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'BORROWED'
  | 'RETURN_PENDING'
  | 'RETURNED'
  | 'UNAVAILABLE';

export interface IResource extends Document {
  name: string;
  description: string;
  category: string;
  images: string[];
  condition: ResourceCondition;
  availability: ResourceAvailability;
  locationZone: string;
  owner: mongoose.Types.ObjectId;
  creditPrice: number; // daily rate
  deposit?: number;
  status: ResourceStatus;
  rules: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
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
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    creditPrice: { type: Number, required: true, min: 1 },
    deposit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'BORROWED', 'RETURN_PENDING', 'RETURNED', 'UNAVAILABLE'],
      default: 'AVAILABLE',
      index: true,
    },
    rules: { type: [String], default: ['Handle with care', 'Return clean and charged/tested'] },
  },
  { timestamps: true }
);

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
