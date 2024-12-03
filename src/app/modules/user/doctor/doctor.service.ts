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

const deleteDoctorByIDFromDB = async (id: string) => {
  const doctor = await User.findByIdAndDelete(id);
  if (!doctor) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Doctor not found');
  }
  return doctor;
};

export const DoctorService = {
  addDoctorToDB,
  deleteDoctorByIDFromDB,
};
