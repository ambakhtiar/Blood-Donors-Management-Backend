import express from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma';
import { USER_ROLE } from '../auth/auth.constant';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from './user.validation';

const router = express.Router();

router.get(
  '/me',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
  UserControllers.getMyProfile
);

router.put(
  '/me',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
  validateRequest(UserValidations.updateProfileSchema),
  UserControllers.updateMyProfile
);

router.get(
  '/donation-history',
  auth(USER_ROLE.USER),
  UserControllers.getDonationHistory
);

// Donor search - Accessible for registered/authenticated users
router.get(
  '/donors',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
  UserControllers.getDonorList
);

router.get(
    '/:userId',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
    UserControllers.getPublicProfile
);

export const UserRoutes = router;
