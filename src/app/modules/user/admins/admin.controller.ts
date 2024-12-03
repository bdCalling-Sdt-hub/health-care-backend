import catchAsync from '../../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { AdminService } from './admin.service';
import sendResponse from '../../../../shared/sendResponse';
import { Request, Response } from 'express';

const addAdmin = catchAsync(async (req: Request, res: Response) => {
  const { ...adminData } = req.body;
  const result = await AdminService.addAdminToDB(adminData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admin created successfully',
    data: result,
  });
});
const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = {
    page: Number(req.query.page),
    limit: Number(req.query.limit),
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
    search: req.query.search as string,
  };
  const result = await AdminService.getAllAdmins(
    paginationOptions.page,
    paginationOptions.limit,
    paginationOptions.sortBy,
    paginationOptions.sortOrder,
    paginationOptions.search
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Admins retrieved successfully',
    data: result.admins,
    pagination: {
      page: paginationOptions.page,
      limit: paginationOptions.limit,
      totalPage: result.totalPages,
      total: result.admins.length,
    },
  });
});
const getSingleAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = (req.params.id as string) || (req.user.id as string);
  if (!id) throw new ApiError(StatusCodes.BAD_REQUEST, 'Admin not found');
  const result = await AdminService.getAdminByIDFromDB(id);

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
  const result = await AdminService.deleteAdminByIDFromDB(id);

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
