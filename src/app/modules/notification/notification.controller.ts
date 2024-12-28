import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';
import { Server } from 'socket.io';

const sendNotification = catchAsync(async (req: Request, res: Response) => {
  const io: Server = req.app.get('io');
  const result = await NotificationService.sendNotification(req.body, io);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notification fetched successfully',
    data: result,
  });
});

export const NotificationController = {
  sendNotification,
};
