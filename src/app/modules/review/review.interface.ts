import { Model, Types } from 'mongoose';

export type IReview = {
  user: Types.ObjectId;
  description: string;
};

export type ReviewModel = Model<IReview>;
