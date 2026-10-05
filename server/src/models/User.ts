import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'USER' | 'ADMIN';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  avatar?: string;
  role: UserRole;
  skills: string[];
  interests: string[];
  locationZone: string;
  availability: string;
  reputationScore: number;
  completedContributions: number;
  cancelledContributions: number;
  verificationSuccessRate: number;
  badges: string[];
  isVerified: boolean;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    locationZone: { type: String, default: 'Greenwood District' },
    availability: { type: String, default: 'Flexible' },
    reputationScore: { type: Number, default: 90, min: 0, max: 100 },
    completedContributions: { type: Number, default: 0 },
    cancelledContributions: { type: Number, default: 0 },
    verificationSuccessRate: { type: Number, default: 100 },
    badges: {
      type: [String],
      default: ['Community Helper'],
    },
    isVerified: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
