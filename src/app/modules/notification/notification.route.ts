import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { NotificationValidation } from './notification.validation';
import { NotificationController } from './notification.controller';
const router = express.Router();

const rolesOfAccess = [...Object.values(USER_ROLES)];

router.post(
  '/send',
  auth(...rolesOfAccess),
  validateRequest(NotificationValidation.sendNotificationZodSchema),
  NotificationController.sendNotification
);

export const NotificationRoutes = router;
