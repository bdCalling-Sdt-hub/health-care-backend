import { Schema, model } from 'mongoose';
  import { IProduct, ProductModel } from './product.interface';
  
  const productSchema = new Schema<IProduct, ProductModel>({
    paymentLink: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true }
  }, { timestamps: true });
  
  export const Product = model<IProduct, ProductModel>('Product', productSchema);
