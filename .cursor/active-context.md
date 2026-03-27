> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\routes\index.ts` (Domain: **Backend (API/Server)**)

### 📐 Backend (API/Server) Conventions & Fixes
- **[what-changed] 🟢 Edited src/app/routes/index.ts (5 changes, 1min)**: Active editing session on src/app/routes/index.ts.
5 content changes over 1 minutes.
- **[what-changed] Replaced auth PostRoutes — improves module reusability**: - import { HospitalRoutes } from '../modules/hospital/hospital.route';
+ import { PostRoutes } from '../modules/post/post.route';
- import { OrganisationRoutes } from '../modules/organisation/organisation.route';
+ 
- import { PostRoutes } from '../modules/post/post.route';
+ const router = Router();
- const router = Router();
+ const moduleRoutes = [
- 
+     { path: '/auth', route: AuthRoutes },
- const moduleRoutes = [
+     { path: '/users', route: UserRoutes },
-     { path: '/auth', route: AuthRoutes },
+     { path: '/posts', route: PostRoutes },
-     { path: '/users', route: UserRoutes },
+ ];
-     { path: '/posts', route: PostRoutes },
+ 
- ];
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ export default router;
- 
- export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[what-changed] Updated API endpoint HospitalRoutes — improves module reusability**: -     { path: '/hospital', route: HospitalRoutes },
+ ];
-     { path: '/organisation', route: OrganisationRoutes },
+ 
- ];
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ export default router;
- 
- export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[convention] 🟢 Edited src/app/routes/index.ts (5 changes, 5min) — confirmed 3x**: Active editing session on src/app/routes/index.ts.
5 content changes over 5 minutes.
- **[convention] Replaced auth PostRoutes — improves module reusability — confirmed 3x**: - 
+ import { PostRoutes } from '../modules/post/post.route';
- const router = Router();
+ 
- 
+ const router = Router();
- const moduleRoutes = [
+ 
-     { path: '/auth', route: AuthRoutes },
+ const moduleRoutes = [
-     { path: '/users', route: UserRoutes },
+     { path: '/auth', route: AuthRoutes },
-     { path: '/posts', route: PostRoutes },
+     { path: '/users', route: UserRoutes },
-     { path: '/hospital', route: HospitalRoutes },
+     { path: '/posts', route: PostRoutes },
-     { path: '/organisation', route: OrganisationRoutes },
+     { path: '/hospital', route: HospitalRoutes },
- ];
+     { path: '/organisation', route: OrganisationRoutes },
- 
+ ];
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ 
- 
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- export default router;
+ 
+ export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[convention] Replaced auth HospitalRoutes — improves module reusability — confirmed 3x**: - import { PostRoutes } from '../modules/post/post.route';
+ import { HospitalRoutes } from '../modules/hospital/hospital.route';
- import { HospitalRoutes } from '../modules/hospital/hospital.route';
+ import { OrganisationRoutes } from '../modules/organisation/organisation.route';
- import { OrganisationRoutes } from '../modules/organisation/organisation.route';
+ 
- 
+ const router = Router();
- const router = Router();
+ 
- 
+ const moduleRoutes = [
- const moduleRoutes = [
+     { path: '/auth', route: AuthRoutes },
-     { path: '/auth', route: AuthRoutes },
+     { path: '/users', route: UserRoutes },
-     { path: '/users', route: UserRoutes },
+     { path: '/posts', route: PostRoutes },
-     { path: '/posts', route: PostRoutes },
+     { path: '/hospital', route: HospitalRoutes },
-     { path: '/hospital', route: HospitalRoutes },
+     { path: '/organisation', route: OrganisationRoutes },
-     { path: '/organisation', route: OrganisationRoutes },
+ ];
- ];
+ 
- 
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ 
- 
+ export default router;
- export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[convention] Replaced auth Router — improves module reusability — confirmed 3x**: - import { PostRoutes } from '../modules/post/post.route';
+ 
- 
+ const router = Router();
- const router = Router();
+ 
- 
+ const moduleRoutes = [
- const moduleRoutes = [
+     { path: '/auth', route: AuthRoutes },
-     { path: '/auth', route: AuthRoutes },
+     { path: '/users', route: UserRoutes },
-     { path: '/users', route: UserRoutes },
+ ];
-     { path: '/posts', route: PostRoutes }
+ 
- ];
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ export default router;
- 
- export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[what-changed] Added API route: /posts**: -     {path: ''}
+     {path: '/posts', route: PostRoutes}

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[convention] what-changed in index.ts — confirmed 3x**: -     {path: }
+     {path: ''}

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[convention] Updated API endpoint index — improves module reusability — confirmed 3x**: -     {
+     {}
-         
+ ];
-     }
+ 
- ];
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ export default router;
- 
- export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[what-changed] Updated API endpoint PostRoutes — improves module reusability**: -     { path: '/posts', route: PostRoutes },
+ ];
- ];
+ 
- 
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ 
- 
+ export default router;
- export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[what-changed] Updated API endpoint HospitalRoutes — improves module reusability**: -     { path: '/hospital', route: HospitalRoutes },
+ ];
-     { path: '/organisation', route: OrganisationRoutes },
+ 
- ];
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ export default router;
- 
- export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[what-changed] Updated API endpoint HospitalRoutes — improves module reusability**: -     { path: '/hospital', route: HospitalRoutes },
+ ];
-     { path: '/organisation', route: OrganisationRoutes },
+ 
- ];
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ export default router;
- 
- export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[what-changed] Replaced auth OrganisationRoutes — improves module reusability**: - 
+ import { OrganisationRoutes } from '../modules/organisation/organisation.route';
- const router = Router();
+ 
- 
+ const router = Router();
- const moduleRoutes = [
+ 
-     { path: '/auth', route: AuthRoutes },
+ const moduleRoutes = [
-     { path: '/users', route: UserRoutes },
+     { path: '/auth', route: AuthRoutes },
-     { path: '/posts', route: PostRoutes },
+     { path: '/users', route: UserRoutes },
-     { path: '/hospital', route: HospitalRoutes },
+     { path: '/posts', route: PostRoutes },
- ];
+     { path: '/hospital', route: HospitalRoutes },
- 
+     { path: '/organisation', route: OrganisationRoutes },
- moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ ];
- export default router;
+ moduleRoutes.forEach((route) => router.use(route.path, route.route));
+ 
+ export default router;

📌 IDE AST Context: Modified symbols likely include [router, moduleRoutes, moduleRoutes.forEach() callback, default]
- **[convention] Replaced auth PostControllers — confirmed 4x**: - 
+ import { PostControllers } from './post.controller';
- const router = Router();
+ 
- 
+ const router = Router();
- router.post(
+ 
-   '/',
+ router.post(
-   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL),
+   '/',
-   validateRequest(createPostSchema),
+   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL),
-   PostControllers.createPost
+   validateRequest(createPostSchema),
- );
+   PostControllers.createPost
- 
+ );
- router.get('/', PostControllers.getAllPosts);
+ 
- router.get('/:id', PostControllers.getSinglePost);
+ router.get('/', PostControllers.getAllPosts);
- 
+ router.get('/:id', PostControllers.getSinglePost);
- router.patch(
+ 
-   '/:id',
+ router.patch(
-   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
+   '/:id',
-   validateRequest(updatePostSchema),
+   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
-   PostControllers.updatePost
+   validateRequest(updatePostSchema),
- );
+   PostControllers.updatePost
- 
+ );
- router.delete(
+ 
-   '/:id',
+ router.delete(
-   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
+   '/:id',
-   PostControllers.deletePost
+   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
- );
+   PostControllers.deletePost
- 
+ );
- router.patch(
+ 
-   '/:id/resolve',
+ router.patch(
-   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL),
+   '/:id/resolve',
-   PostControllers.resolvePost
+   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL),
- );
+   PostControllers.resolvePost
- 
+ );
- router.patch(
+ 
-   '/:id/approve',
+ router.patch(
-   auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
+   '/:id/approve',
-   PostControllers.approvePost
+   auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
- );
+   PostControllers.approvePost
- 
+ )
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [router, PostRoutes]
