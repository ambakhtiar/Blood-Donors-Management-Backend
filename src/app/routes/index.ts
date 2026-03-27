import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { PostRoutes } from '../modules/post/post.route';
import { HospitalRoutes } from '../modules/hospital/hospital.route';
import { OrganisationRoutes } from '../modules/organisation/organisation.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { PaymentRoutes } from '../modules/payment/payment.route';

const router = Router();

const moduleRoutes = [
    { path: '/auth', route: AuthRoutes },
    { path: '/users', route: UserRoutes },
    { path: '/posts', route: PostRoutes },
    { path: '/hospitals', route: HospitalRoutes },
    { path: '/organisations', route: OrganisationRoutes },
    { path: '/admin', route: AdminRoutes },
    { path: '/payments', route: PaymentRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;