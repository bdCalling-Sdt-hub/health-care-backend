import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { Product } from './product.model';
import { IProduct } from './product.interface';
import { productData } from '../../../../seed/seedProduct';

const createProduct = async (payload: IProduct): Promise<IProduct> => {
  const result = await Product.create(payload);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product!');
  }
  return result;
};

const getConsultationLink = async (): Promise<any> => {
  const result = await Product.findOne({ name: productData.name });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found!');
  }
  return result.paymentLink;
};

export const ProductService = {
  createProduct,
  getConsultationLink,
};
