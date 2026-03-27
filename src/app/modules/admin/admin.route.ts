import { Router } from 'express';
import { AdminControllers } from './admin.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma';

const router = Router();

router.get(
  '/users',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getAllUsers
);

router.patch(
  '/users/:id/status',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.changeUserStatus
);

router.get(
  '/analytics',
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  AdminControllers.getSystemAnalytics
);

export const AdminRoutes = router;
