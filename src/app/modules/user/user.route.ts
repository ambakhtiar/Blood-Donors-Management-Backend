import express from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma';

const router = express.Router();

router.get(
  '/me',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
  UserControllers.getMyProfile
);

router.put(
  '/me',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
  UserControllers.updateMyProfile
);

// Donor search - Accessible for registered/authenticated users
router.get(
    '/donors',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
    UserControllers.getDonorList
);

export const UserRoutes = router;
