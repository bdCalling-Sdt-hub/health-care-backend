import express from 'express';
import { ProductController } from './product.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductValidation } from './product.validation';

const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN];
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(ProductValidation.createProductZodSchema),
  ProductController.createProduct
);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.patch(
  '/:id',
  auth(...rolesOfAccess),
  validateRequest(ProductValidation.updateProductZodSchema),
  ProductController.updateProduct
);
router.delete('/:id', auth(...rolesOfAccess), ProductController.deleteProduct);

export const ProductRoutes = router;