import express from 'express';
import { ManageAdminControllers } from './manageAdmin.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma';
import validateRequest from '../../middlewares/validateRequest';
import { ManageAdminValidations } from './manageAdmin.validation';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.SUPER_ADMIN),
  validateRequest(ManageAdminValidations.createAdminSchema),
  ManageAdminControllers.createAdmin
);

router.get(
  '/',
  auth(UserRole.SUPER_ADMIN),
  ManageAdminControllers.getAllAdmins
);

router.get(
  '/:id',
  auth(UserRole.SUPER_ADMIN),
  ManageAdminControllers.getSingleAdmin
);

router.patch(
  '/:id',
  auth(UserRole.SUPER_ADMIN),
  validateRequest(ManageAdminValidations.updateAdminSchema),
  ManageAdminControllers.updateAdmin
);

router.patch(
  '/:id/access',
  auth(UserRole.SUPER_ADMIN),
  validateRequest(ManageAdminValidations.changeAdminAccessSchema),
  ManageAdminControllers.changeAdminAccess
);

router.delete(
  '/:id',
  auth(UserRole.SUPER_ADMIN),
  ManageAdminControllers.deleteAdmin
);

export const ManageAdminRoutes = router;
