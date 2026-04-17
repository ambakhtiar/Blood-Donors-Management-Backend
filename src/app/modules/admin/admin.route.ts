import { Router } from 'express';
import { AdminControllers } from './admin.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';

const router = Router();


router.get(
  '/analytics',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getSystemAnalytics
);

router.get(
  '/users',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllUsers
);

router.get(
  '/donors',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllDonors
);

router.patch(
  '/users/:id/status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(AdminValidation.changeUserStatusSchema),
  AdminControllers.changeUserStatus
);

router.get(
  '/hospitals',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllHospitals
);

router.patch(
  '/hospitals/:id/status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(AdminValidation.changeUserStatusSchema),
  AdminControllers.updateHospitalStatus
);

router.get(
  '/organisations',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllOrganisations
);


router.patch(
  '/organisations/:id/status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(AdminValidation.changeUserStatusSchema),
  AdminControllers.updateOrganisationStatus
);

export const AdminRoutes = router;
