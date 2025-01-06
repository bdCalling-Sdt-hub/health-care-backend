import { Model } from 'mongoose';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../app/modules/user/user.model';

const getAllDataFromDB = async (query: any, model: Model<any>) => {
  const {
    search = '',
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    ...filtersData
  } = query;

  const andConditions: any = [];

  if (search) {
    andConditions.push({
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const whereConditions =
    andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

  const data = await model
    .find(whereConditions)
    .sort({ [sortBy]: sortOrder })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .select('-password');

  const totalPages = Math.ceil(
    (await model.countDocuments(whereConditions)) / Number(limit)
  );

  return {
    data,
    totalPages,
  };
};
const getSingleDataFromDB = async (id: string, model: Model<any>) => {
  const result = await model.findById(id);
  if (!result) throw new Error('Data not found');
  return result;
};
const deleteDataByIDFromDB = async (id: string, Model: Model<any>) => {
  const isExistData = await Model.findById(id);
  if (!isExistData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Data not found');
  }
  const deletedData = await Model.findByIdAndDelete(id);
  if (!deletedData) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Data not found');
  }
  return deletedData;
};
const addDataToDB = async (data: any, model: Model<any>) => {
  const result = await model.create(data);

  return result;
};

const getWebsiteStatus = async () => {
  const allUsers: any = await User.find();
  const oneYearAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365);
  const oneMonthAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
  const totalUsersLastYear = allUsers.filter(
    (user: any) => user.createdAt > oneYearAgo
  ).length;
  const totalUsersLastMonth = allUsers.filter(
    (user: any) => user.createdAt > oneMonthAgo
  ).length;
  return {
    totalUsers: allUsers.length,
    totalUsersLastYear,
    totalUsersLastMonth,
  };
};

export const HelperService = {
  getAllDataFromDB,
  getSingleDataFromDB,
  deleteDataByIDFromDB,
  addDataToDB,
  getWebsiteStatus,
};
