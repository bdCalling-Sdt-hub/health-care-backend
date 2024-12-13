import { Model, Types } from 'mongoose';

export type IFaq = {
  question: string;
  answer: string;
};

export type FaqModel = Model<IFaq>;
