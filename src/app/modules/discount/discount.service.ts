import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Discount } from './discount.model';
import { IDiscount } from './discount.interface';
import { calculateRedemptionTime } from '../../../helpers/calculateRedemtionTime';
import { stripeHelper } from '../../../helpers/stripeHelper';
import stripe from '../../../config/stripe';

const createDiscount = async (payload: IDiscount): Promise<IDiscount> => {
  console.log(payload);
  const redemptionTime = calculateRedemptionTime(
    new Date().toString(),
    payload.endDate.toString()
  );
  const data = await stripeHelper.createCoupon(payload.rate, 1, redemptionTime);
  const result = await Discount.create({ stripeCouponId: data.id, ...payload });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create discount!');
  }
  return result;
};

const getAllDiscounts = async (
  queryFields: Record<string, any>
): Promise<IDiscount[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Discount.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getDiscountById = async (id: string): Promise<IDiscount | null> => {
  const result = await Discount.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Discount not found!');
  }
  return result;
};

const updateDiscount = async (
  id: string,
  payload: IDiscount
): Promise<IDiscount | null> => {
  false;
  const isExistDiscount = await getDiscountById(id);
  if (!isExistDiscount) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Discount not found!');
  }
  false;
  const result = await Discount.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to update discount!');
  }
  return result;
};

const deleteDiscount = async (id: string): Promise<IDiscount | null> => {
  const isExistDiscount = await getDiscountById(id);
  if (!isExistDiscount) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Discount not found!');
  }
  false;
  const result = await Discount.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete discount!');
  }
  return result;
};

export const DiscountService = {
  createDiscount,
  getAllDiscounts,
  getDiscountById,
  updateDiscount,
  deleteDiscount,
};
