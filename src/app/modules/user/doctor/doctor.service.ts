import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../../enums/user';
import ApiError from '../../../../errors/ApiError';
import { emailHelper } from '../../../../helpers/emailHelper';
import { emailTemplate } from '../../../../shared/emailTemplate';
import unlinkFile from '../../../../shared/unlinkFile';
import generateOTP from '../../../../util/generateOTP';
import { IUser } from '../../user/user.interface';
import { User } from '../../user/user.model';

const addDoctorToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.DOCTOR;
  payload.verified = true;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  return createUser;
};

const getAllDoctors = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  search: string
) => {
  const searchConditions = search
    ? {
        $and: [
          { role: USER_ROLES.DOCTOR },
          {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          },
        ],
      }
    : { role: USER_ROLES.DOCTOR };

  const doctors = await User.find(searchConditions)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-password');

  const totalPages = Math.ceil(
    (await User.countDocuments(searchConditions)) / limit
  );

  return {
    doctors,
    totalPages,
  };
};

const getDoctorByIDFromDB = async (id: string) => {
  const doctor = await User.findById(id);
  if (!doctor) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Doctor not found');
  }
  return doctor;
};

const deleteDoctorByIDFromDB = async (id: string) => {
  const doctor = await User.findByIdAndDelete(id);
  if (!doctor) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Doctor not found');
  }
  return doctor;
};

export const DoctorService = {
  addDoctorToDB,
  getAllDoctors,
  getDoctorByIDFromDB,
  deleteDoctorByIDFromDB,
};
