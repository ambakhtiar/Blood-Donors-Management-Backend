import express from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma';
import { NotificationControllers } from './notification.controller';

const router = express.Router();

router.get(
    '/',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
    NotificationControllers.getMyNotifications
);

router.patch(
    '/mark-all-read',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
    NotificationControllers.markAllAsRead
);

router.patch(
    '/:id',
    auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.USER),
    NotificationControllers.markAsRead
);

export const NotificationRoutes = router;
