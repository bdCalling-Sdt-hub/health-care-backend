import catchAsync from '../../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { DoctorService } from './doctor.service';
import sendResponse from '../../../../shared/sendResponse';
import { Request, Response } from 'express';

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
  const paginationOptions = {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
    search: req.query.search as string,
  };
  const result = await DoctorService.getAllDoctors(
    paginationOptions.page,
    paginationOptions.limit,
    paginationOptions.sortBy,
    paginationOptions.sortOrder,
    paginationOptions.search
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Doctors retrieved successfully',
    data: result.doctors,
    pagination: {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      totalPage: result.totalPages,
      total: result.doctors.length,
    },
  });
});

const getSingleDoctor = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params.id as string) || (req.user.id as string);
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Doctor not found');
  const result = await DoctorService.getDoctorByIDFromDB(id);

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
