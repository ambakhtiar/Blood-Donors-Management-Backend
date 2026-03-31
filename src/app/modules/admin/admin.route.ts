import { Router } from 'express';
import { AdminControllers } from './admin.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';

const router = Router();

router.get(
  '/users',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllUsers
);

router.patch(
  '/users/:id/status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(AdminValidation.changeUserStatusSchema),
  AdminControllers.changeUserStatus
);

router.get(
  '/analytics',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getSystemAnalytics
);

router.get(
  '/hospitals',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllHospitals
);

router.get(
  '/organisations',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllOrganisations
);

router.patch(
  '/approve-hospital/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.approveHospital
);

router.patch(
  '/approve-organisation/:id',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.approveOrganisation
);

export const AdminRoutes = router;
