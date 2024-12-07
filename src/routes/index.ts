import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { SubCategoryRoutes } from '../app/modules/subCategory/subCategory.route';
import { MedicineRoutes } from '../app/modules/medicine/medicine.route';
import { ShippingDetailsRoutes } from '../app/modules/shippingDetails/shippingDetails.route';
import { DiscountRoutes } from '../app/modules/discount/discount.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/subcategory',
    route: SubCategoryRoutes,
  },
  {
    path: '/medicine',
    route: MedicineRoutes,
  },
  {
    path: '/shippingdetails',
    route: ShippingDetailsRoutes,
  },
  {
    path: '/discount',
    route: DiscountRoutes,
  },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
