import { Model } from 'mongoose';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../app/modules/user/user.model';
import { Consultation } from '../app/modules/consultation/consultation.model';
import { STATUS } from '../enums/consultation';

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
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // Get users per year for last 12 years
  const usersPerYear = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const year = currentYear - i;
      return User.countDocuments({
        createdAt: {
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1),
        },
      });
    })
  );

  // Get users per month for current year
  const usersPerMonth = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      return User.countDocuments({
        createdAt: {
          $gte: new Date(currentYear, i, 1),
          $lt: new Date(currentYear, i + 1, 1),
        },
      });
    })
  );

  // Get total users
  const totalUsers = await User.countDocuments();

  // Format year data
  const last12YearsUsers = usersPerYear.map((count, index) => ({
    year: currentYear - index,
    totalUsers: count,
  }));

  // Format month data
  const currentYearUsers = usersPerMonth.map((count, index) => ({
    month: index + 1,
    year: currentYear,
    totalUsers: count,
  }));

  // Get earnings data (keeping the existing logic)
  const last12YearsEarnings: { year: number; earnings: number }[] = [];
  const last12MonthsEarnings: {
    month: number;
    year: number;
    earnings: number;
  }[] = [];

  for (let i = 0; i < 12; i++) {
    const yearStart = new Date(currentYear - i, 0, 1);
    const yearEnd = new Date(currentYear - i + 1, 0, 1);

    const monthStart = new Date(currentYear, i, 1);
    const monthEnd = new Date(currentYear, i + 1, 1);

    const yearConsultations = await Consultation.countDocuments({
      createdAt: { $gte: yearStart, $lt: yearEnd },
      status: { $ne: STATUS.DRAFT },
    });

    const monthConsultations = await Consultation.countDocuments({
      createdAt: { $gte: monthStart, $lt: monthEnd },
      status: { $ne: STATUS.DRAFT },
    });

    last12YearsEarnings.push({
      year: yearStart.getFullYear(),
      earnings: yearConsultations * 25,
    });

    last12MonthsEarnings.push({
      month: monthStart.getMonth() + 1,
      year: monthStart.getFullYear(),
      earnings: monthConsultations * 25,
    });
  }

  return {
    totalUsers,
    last12YearsData: last12YearsUsers,
    currentYearData: currentYearUsers,
    last12MonthsEarnings,
    last12YearsEarnings,
  };
};

export const HelperService = {
  getAllDataFromDB,
  getSingleDataFromDB,
  deleteDataByIDFromDB,
  addDataToDB,
  getWebsiteStatus,
};
