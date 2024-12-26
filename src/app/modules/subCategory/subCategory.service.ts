import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { SubCategory } from './subCategory.model';
import { ISubCategory } from './subCategory.interface';
import unlinkFile from '../../../shared/unlinkFile';
import { SubCategoryValidation } from './subCategory.validation';

const createSubCategory = async (
  payload: ISubCategory
): Promise<ISubCategory> => {
  await SubCategoryValidation.createSubCategoryZodSchema.parseAsync(payload);
  const result = await SubCategory.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create subCategory!'
    );
  }
  return result;
};

const getAllSubCategorys = async (
  search: string,
  page: number | null,
  limit: number | null,
  queryFields: any
): Promise<ISubCategory[]> => {
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { image: { $regex: search, $options: 'i' } },
          { details: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  let queryBuilder = SubCategory.find({ ...query, ...queryFields });

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }

  return await queryBuilder;
};

const getSubCategoryById = async (id: string): Promise<ISubCategory | null> => {
  const result = await SubCategory.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'SubCategory not found!');
  }
  return result;
};

const updateSubCategory = async (
  id: string,
  payload: ISubCategory
): Promise<ISubCategory | null> => {
  await SubCategoryValidation.updateSubCategoryZodSchema.parseAsync(payload);
  if (payload.image) {
    await unlinkFile(payload.image);
  }
  const isExistSubCategory = await getSubCategoryById(id);
  if (!isExistSubCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'SubCategory not found!');
  }
  const result = await SubCategory.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update subCategory!'
    );
  }
  return result;
};

const deleteSubCategory = async (id: string): Promise<ISubCategory | null> => {
  const isExistSubCategory = await getSubCategoryById(id);
  if (!isExistSubCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'SubCategory not found!');
  }
  if (typeof isExistSubCategory.image === 'string') {
    await unlinkFile(isExistSubCategory.image);
  }
  const result = await SubCategory.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete subCategory!'
    );
  }
  return result;
};

export const SubCategoryService = {
  createSubCategory,
  getAllSubCategorys,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
};
