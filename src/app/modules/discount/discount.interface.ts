import { Model, Types } from 'mongoose';

export type IDiscount = {
  name: string;
  code: string;
  startDate: Date;
  endDate: Date;
  rate: number;
  stripeCouponId?: string;
};

export type DiscountModel = Model<IDiscount>;
