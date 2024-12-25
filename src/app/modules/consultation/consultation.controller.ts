import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ConsultationService } from './consultation.service';
import ApiError from '../../../errors/ApiError';
const createConsultation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await ConsultationService.createConsultation(req.body, userId);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Consultation created successfully',
    data: result,
  });
});
const createConsultationSuccess = catchAsync(
  async (req: Request, res: Response) => {
    const { session_id, id } = req.query;
    if (!session_id || !id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Session id and id are required'
      );
    }
    const result = await ConsultationService.createConsultationSuccess(
      session_id.toString(),
      id.toString()
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Consultation created successfully',
      data: result,
    });
  }
);
export const ConsultationController = {
  createConsultation,
  createConsultationSuccess,
};
