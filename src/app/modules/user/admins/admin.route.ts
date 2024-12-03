import { Router } from 'express';
import { AdminController } from './admin.controller';
import validateRequest from '../../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
const router = Router();
router.post(
  '/',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  validateRequest(AdminValidation.createAdminZodSchema),
  AdminController.addAdmin
);
router.get(
  '/all',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.getAllAdmins
);
router.get(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.getSingleAdmin
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  AdminController.deleteAdmin
);
export const AdminRoutes = router;
