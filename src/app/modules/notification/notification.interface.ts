import { Types, Model } from 'mongoose';
export type INotification = {
  title: string;
  description?: string;
  recieverId: Types.ObjectId;
};
export type NotificationModel = Model<INotification>;
