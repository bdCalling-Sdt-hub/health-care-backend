import { Schema, model } from 'mongoose';
  import { IDiscount, DiscountModel } from './discount.interface';
  
  const discountSchema = new Schema<IDiscount, DiscountModel>({
    name: { type: String, required: true },
  code: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  rate: { type: Number, required: true }
  }, { timestamps: true });
  
  export const Discount = model<IDiscount, DiscountModel>('Discount', discountSchema);
