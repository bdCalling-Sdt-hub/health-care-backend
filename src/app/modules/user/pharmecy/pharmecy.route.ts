import { Router } from 'express';
import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { PharmecyValidation } from './pharmecy.validation';
import { PharmecyController } from './pharmecy.controller';

const router = Router();

router.post(
  '/',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  validateRequest(PharmecyValidation.createPharmecyZodSchema),
  PharmecyController.addPharmecy
);
router.get(
  '/all',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  PharmecyController.getAllPharmecy
);
router.get(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  PharmecyController.getSinglePharmecy
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN),
  PharmecyController.deletePharmecy
);

export const PharmecyRoutes = router;
