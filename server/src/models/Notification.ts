import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'MATCH_FOUND'
  | 'REQUEST_ACCEPTED'
  | 'REQUEST_COMPLETED'
  | 'VERIFICATION_REQUIRED'
  | 'CREDITS_RECEIVED'
  | 'GOODWILL_REQUEST'
  | 'GOODWILL_ACCEPTED'
  | 'RESOURCE_REQUEST'
  | 'RESOURCE_RETURN'
  | 'WITHDRAWAL_STATUS'
  | 'DISPUTE_UPDATE';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'MATCH_FOUND',
        'REQUEST_ACCEPTED',
        'REQUEST_COMPLETED',
        'VERIFICATION_REQUIRED',
        'CREDITS_RECEIVED',
        'GOODWILL_REQUEST',
        'GOODWILL_ACCEPTED',
        'RESOURCE_REQUEST',
        'RESOURCE_RETURN',
        'WITHDRAWAL_STATUS',
        'DISPUTE_UPDATE',
      ],
      required: true,
      index: true,
    },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
