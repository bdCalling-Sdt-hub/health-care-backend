import { model, Schema, Types } from 'mongoose';
import { INotification, NotificationModel } from './notification.interface';

const notificationSchema = new Schema<INotification, NotificationModel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: {
      type: String,
      required: false,
    },
    recieverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Title is required'],
    },
  },
  { timestamps: true }
);

export const Notification = model<INotification, NotificationModel>(
  'Notification',
  notificationSchema
);
