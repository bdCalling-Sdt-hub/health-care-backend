import { Model, Types } from 'mongoose';

export type IProduct = {
  paymentLink: string;
  name: string;
  description: string;
  price: string;
};

export type ProductModel = Model<IProduct>;
