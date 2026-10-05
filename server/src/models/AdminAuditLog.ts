import mongoose, { Document, Schema } from 'mongoose';

export type AdminAction =
  | 'USER_SUSPENDED'
  | 'USER_ACTIVATED'
  | 'CREDIT_ADJUSTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'RESOURCE_REMOVED'
  | 'DISPUTE_RESOLVED';

export interface IAdminAuditLog extends Document {
  admin: mongoose.Types.ObjectId;
  action: AdminAction;
  entity: string;
  entityId: string;
  previousState?: any;
  newState?: any;
  reason: string;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: [
        'USER_SUSPENDED',
        'USER_ACTIVATED',
        'CREDIT_ADJUSTED',
        'WITHDRAWAL_APPROVED',
        'WITHDRAWAL_REJECTED',
        'RESOURCE_REMOVED',
        'DISPUTE_RESOLVED',
      ],
      required: true,
      index: true,
    },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    reason: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AdminAuditLog = mongoose.model<IAdminAuditLog>(
  'AdminAuditLog',
  AdminAuditLogSchema
);
