import { Model } from 'mongoose';
import { GENDER, USER_ROLES } from '../../../enums/user';

export type IUser = {
  firstName?: string;
  lastName?: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  location: string;
  doctorType?: string;
  gender: GENDER;
  profile?: string;
  dateOfBirth?: string;
  status: 'active' | 'delete';
  verified: boolean;
  pharmecyName?: string;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
