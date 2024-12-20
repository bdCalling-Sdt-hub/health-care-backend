import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { ConsultationService } from './consultation.service';
const createConsultation = catchAsync(async (req: Request, res: Response) => {
  const result = await ConsultationService.createConsultation(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Consultation created successfully',
    data: result,
  });
});

export const ConsultationController = {
  createConsultation,
};
