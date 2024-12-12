import { StatusCodes } from 'http-status-codes';
  import ApiError from '../../../errors/ApiError';
  import { Product } from './product.model';
  import { IProduct } from './product.interface';
  
  const createProduct = async (payload: IProduct): Promise<IProduct> => {
    
    const result = await Product.create(payload);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create product!');
    }
    return result;
  };
  
  const getAllProducts = async (queryFields: Record<string, any>): Promise<IProduct[]> => {
  const { search, page, limit } = queryFields;
    const query = search ? { $or: [{ paymentLink: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: { $regex: search, $options: 'i' } }] } : {};
    let queryBuilder = Product.find(query);
  
    if (page && limit) {
      queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
    }
    delete queryFields.search;
    delete queryFields.page;
    delete queryFields.limit;
    queryBuilder.find(queryFields);
    return await queryBuilder;
  };
  
  
  const getProductById = async (id: string): Promise<IProduct | null> => {
    const result = await Product.findById(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found!');
    }
    return result;
  };
  
  const updateProduct = async (id: string, payload: IProduct): Promise<IProduct | null> => {
      
    const isExistProduct = await getProductById(id);
    if (!isExistProduct) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found!');
    }
    
    const result = await Product.findByIdAndUpdate(id, payload, { new: true });
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update product!');
    }
    return result;
  };
  
  const deleteProduct = async (id: string): Promise<IProduct | null> => {
    const isExistProduct = await getProductById(id);
    if (!isExistProduct) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Product not found!');
    }
        
    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete product!');
    }
    return result;
  };
  
  export const ProductService = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
  };
