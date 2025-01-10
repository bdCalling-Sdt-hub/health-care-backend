import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ReviewService } from './review.service';
import { USER_ROLES } from '../../../enums/user';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const data = {
    user: req.user.id,
    ...req.body,
  };
  const result = await ReviewService.createReview(data);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const role = req.user.role || USER_ROLES.USER;

  const result = await ReviewService.getAllReviews(query, role);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews fetched successfully',
    data: result,
  });
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviewById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review fetched successfully',
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.updateReview(req.params.id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteReview(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
