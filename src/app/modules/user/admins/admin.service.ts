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

const addAdminToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  //set role
  payload.role = USER_ROLES.ADMIN;
  payload.verified = true;
  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }
  return createUser;
};

const getAllAdmins = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  search: string
) => {
  const searchConditions = search
    ? {
        $and: [
          { role: USER_ROLES.ADMIN },
          {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
            ],
          },
        ],
      }
    : { role: USER_ROLES.ADMIN };

  const admins = await User.find(searchConditions)
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-password');

  const totalPages = Math.ceil(
    (await User.countDocuments(searchConditions)) / limit
  );

  return {
    admins,
    totalPages,
  };
};

const getAdminByIDFromDB = async (id: string) => {
  const admin = await User.findById(id);
  if (!admin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found');
  }
  return admin;
};

const deleteAdminByIDFromDB = async (id: string) => {
  const admin = await User.findByIdAndDelete(id);
  if (!admin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found');
  }
  return admin;
};

export const AdminService = {
  addAdminToDB,
  getAllAdmins,
  getAdminByIDFromDB,
  deleteAdminByIDFromDB,
};
