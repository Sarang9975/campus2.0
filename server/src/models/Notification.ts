import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'NEW_MATCH'
  | 'MEMBER_JOINED'
  | 'RECONFIRM_REQUIRED'
  | 'SPOT_RELEASED'
  | 'BENCH_OFFER'
  | 'PLAN_RECOVERED'
  | 'ACTIVITY_REMINDER'
  | 'CHECK_IN_OPEN'
  | 'PLAN_COMPLETED'
  | 'REPEAT_INVITATION';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  planId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'NEW_MATCH',
        'MEMBER_JOINED',
        'RECONFIRM_REQUIRED',
        'SPOT_RELEASED',
        'BENCH_OFFER',
        'PLAN_RECOVERED',
        'ACTIVITY_REMINDER',
        'CHECK_IN_OPEN',
        'PLAN_COMPLETED',
        'REPEAT_INVITATION',
      ],
      required: true,
    },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    actionUrl: { type: String },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
