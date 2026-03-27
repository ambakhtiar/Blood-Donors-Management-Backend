import express from 'express';
import { AuthControllers } from './auth.controller';
import auth from '../../middlewares/auth';
import { Gender, UserRole } from '../../../generated/prisma';

const router = express.Router();

router.post('/register', AuthControllers.registerUser);
router.post('/login', AuthControllers.loginUser);
router.post('/refresh-token', AuthControllers.refreshToken);
router.post(
  '/change-password',
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
  AuthControllers.changePassword
);
router.post('/forgot-password', AuthControllers.forgotPassword);
router.post('/reset-password', AuthControllers.resetPassword);

export const AuthRoutes = router;
