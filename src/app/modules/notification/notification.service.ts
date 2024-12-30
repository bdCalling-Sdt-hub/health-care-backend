import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Notification } from './notification.model';
import { INotification } from './notification.interface';
import { Server } from 'socket.io';
import { NOTIFICATION_STATUS } from './notification.constant';

const createNotification = async (
  payload: INotification,
  io: Server
): Promise<INotification> => {
  const result = await Notification.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create notification!'
    );
  }
  io.emit(`NEW_NOTIFICATION::${result.reciever}`, result);
  return result;
};

const getAllNotifications = async (
  queryFields: Record<string, any>
): Promise<INotification[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Notification.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getNotificationById = async (
  id: string
): Promise<INotification | null> => {
  const result = await Notification.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }
  return result;
};

const updateNotification = async (
  id: string,
  payload: INotification
): Promise<INotification | null> => {
  const isExistNotification = await getNotificationById(id);
  if (!isExistNotification) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }

  const result = await Notification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to update notification!'
    );
  }
  return result;
};

const deleteNotification = async (
  id: string
): Promise<INotification | null> => {
  const isExistNotification = await getNotificationById(id);
  if (!isExistNotification) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Notification not found!');
  }

  const result = await Notification.findByIdAndDelete(id);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete notification!'
    );
  }
  return result;
};

const readNotificationFromDB = async (userId: string) => {
  const readAllNotifications = await Notification.updateMany(
    { reciever: userId },
    { $set: { status: NOTIFICATION_STATUS.READ } }
  );
  if (!readAllNotifications) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Notification did not read successfully'
    );
  }
  return { message: 'Message read successfully' };
};

export const NotificationService = {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  readNotificationFromDB,
};
