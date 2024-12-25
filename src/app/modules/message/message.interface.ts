import { Model, Types } from 'mongoose';

export type IMessage = {
  type: string;
  name: string;
  phone?: string;
  email?: string;
  description?: string;
};

export type MessageModel = Model<IMessage>;
