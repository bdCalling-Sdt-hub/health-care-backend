import express from 'express';
import { DiscountController } from './discount.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DiscountValidation } from './discount.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(DiscountValidation.createDiscountZodSchema),
  DiscountController.createDiscount
);
router.get('/', DiscountController.getAllDiscounts);
router.get('/:id', DiscountController.getDiscountById);

router.delete(
  '/:id',
  auth(...rolesOfAccess),
  DiscountController.deleteDiscount
);

export const DiscountRoutes = router;
