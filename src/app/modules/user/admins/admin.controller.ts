import catchAsync from '../../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import sendResponse from '../../../../shared/sendResponse';
import { Request, Response } from 'express';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { HelperService } from '../../../../helpers/helper.service';
import { USER_ROLES } from '../../../../enums/user';

const addAdmin = catchAsync(async (req: Request, res: Response) => {
  const { ...adminData } = req.body;
  adminData.verified = true;
  adminData.role = USER_ROLES.ADMIN;
  const result = await HelperService.addDataToDB(adminData, User);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin created successfully',
    data: result,
  });
});
const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  query.role = USER_ROLES.ADMIN;

  const result = await HelperService.getAllDataFromDB(query, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admins retrieved successfully',
    data: result.data,
    pagination: {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      totalPage: result.totalPages,
      total: result.data.length,
    },
  });
});
const getSingleAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params.id as string) || (req.user.id as string);
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found');
  const result = await HelperService.getSingleDataFromDB(id, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin retrieved successfully',
    data: result,
  });
});
const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found');
  const result = await HelperService.deleteDataByIDFromDB(id, User);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin deleted successfully',
    data: result,
  });
});
export const AdminController = {
  addAdmin,
  getAllAdmins,
  getSingleAdmin,
  deleteAdmin,
};
