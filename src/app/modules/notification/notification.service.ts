import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { Server } from 'socket.io';

const sendNotification = async (
  payload: INotification,
  io: Server
): Promise<INotification> => {
  const result = await Notification.create(payload);
  io.emit(`NEW_NOTIFICATION::${payload.recieverId?.toString()}`, payload);

  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create notification!'
    );
  }

  return result;
};
export const NotificationService = {
  sendNotification,
};
