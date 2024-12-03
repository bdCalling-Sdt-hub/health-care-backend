import catchAsync from '../../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { DoctorService } from './doctor.service';
import sendResponse from '../../../../shared/sendResponse';
import { Request, Response } from 'express';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { HelperService } from '../../../../helpers/helper.service';
import { USER_ROLES } from '../../../../enums/user';

const addDoctor = catchAsync(async (req: Request, res: Response) => {
  const { ...doctorData } = req.body;
  const result = await DoctorService.addDoctorToDB(doctorData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctor created successfully',
    data: result,
  });
});

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  query.role = USER_ROLES.DOCTOR;
  const result = await HelperService.getAllDataFromDB(query, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctors data retrieved successfully',
    data: result.data,
    pagination: {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      totalPage: result.totalPages,
      total: result.data.length,
    },
  });
});
const getSingleDoctor = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params.id as string) || (req.user.id as string);
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Doctor not found');
  const result = await HelperService.getSingleDataFromDB(id, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctor retrieved successfully',
    data: result,
  });
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Doctor not found');
  const result = await DoctorService.deleteDoctorByIDFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctor deleted successfully',
    data: result,
  });
});

export const DoctorController = {
  addDoctor,
  getAllDoctors,
  getSingleDoctor,
  deleteDoctor,
};