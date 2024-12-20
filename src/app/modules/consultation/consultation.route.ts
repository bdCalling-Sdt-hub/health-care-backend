
  import express from 'express';
import { ConsultationValidation } from './consultation.validation';
import { ConsultationController } from './consultation.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();
const rolesOfAccess = [USER_ROLES.ADMIN] // all the user role who you want to give access to create, update and delete route
// a route example
router.post(
  '/create',
  auth(...rolesOfAccess),
  validateRequest(ConsultationValidation.createConsultationZodSchema),
  ConsultationController.createConsultation
);
  
  
  export const ConsultationRoutes = router;
  