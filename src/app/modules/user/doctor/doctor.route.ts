import { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { DoctorValidation } from './doctor.validation';
import { DoctorController } from './doctor.controller';

const router = Router();

router.post(
  '/',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  validateRequest(DoctorValidation.createDoctorZodSchema),
  DoctorController.addDoctor
);
router.get(
  '/all',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  DoctorController.getAllDoctors
);
router.get(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  DoctorController.getSingleDoctor
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  DoctorController.deleteDoctor
);

export const DoctorRoutes = router;
