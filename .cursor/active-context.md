> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src\app\routes\index.ts` (Domain: **Backend (API/Server)**)

### 📐 Backend (API/Server) Conventions & Fixes
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
- **[what-changed] Replaced auth Auth**: - import { PostControllers } from './post.controller';
+ import validateRequest from '../../middlewares/validateRequest';
- import validateRequest from '../../middlewares/validateRequest';
+ import { createPostSchema, updatePostSchema } from './post.validation';
- import { createPostSchema, updatePostSchema } from './post.validation';
+ import auth from '../../middlewares/auth';
- import auth from '../../middlewares/auth';
+ import { USER_ROLE } from '../Auth/auth.constant';
- import { USER_ROLE } from '../Auth/auth.constant';
+ 
- 
+ const router = Router();
- const router = Router();
+ 
- 
+ router.post(
- router.post(
+   '/',
-   '/',
+   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL),
-   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL),
+   validateRequest(createPostSchema),
-   validateRequest(createPostSchema),
+   PostControllers.createPost
-   PostControllers.createPost
+ );
- );
+ 
- 
+ router.get('/', PostControllers.getAllPosts);
- router.get('/', PostControllers.getAllPosts);
+ router.get('/:id', PostControllers.getSinglePost);
- router.get('/:id', PostControllers.getSinglePost);
+ 
- 
+ router.patch(
- router.patch(
+   '/:id',
-   '/:id',
+   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
-   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
+   validateRequest(updatePostSchema),
-   validateRequest(updatePostSchema),
+   PostControllers.updatePost
-   PostControllers.updatePost
+ );
- );
+ 
- 
+ router.delete(
- router.delete(
+   '/:id',
-   '/:id',
+   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
-   auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
+   PostControllers.deletePost
-   PostControllers.deletePost
+ );
- );
+ 
- 
+ router.patch(
- router.patch(
+   '/:id/resolve',
-   '/:id
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [router, PostRoutes]
- **[what-changed] 🟢 Edited src/app/modules/post/post.route.ts (6 changes, 3min)**: Active editing session on src/app/modules/post/post.route.ts.
6 content changes over 3 minutes.
- **[what-changed] Updated schema IPaginationOptions**: - 
+ import { IPaginationOptions, IPostFilters } from './post.interface';
- const createPost = catchAsync(async (req: Request, res: Response) => {
+ 
-   const result = await PostServices.createPost(req.user, req.body);
+ const createPost = catchAsync(async (req: Request, res: Response) => {
- 
+   const result = await PostServices.createPost(req.user, req.body);
-   sendResponse(res, {
+ 
-     statusCode: httpStatus.CREATED,
+   sendResponse(res, {
-     success: true,
+     statusCode: httpStatus.CREATED,
-     message: 'Post created successfully',
+     success: true,
-     data: result,
+     message: 'Post created successfully',
-   });
+     data: result,
- });
+   });
- 
+ });
- const getAllPosts = catchAsync(async (req: Request, res: Response) => {
+ 
-   const filters = pick(req.query, ['searchTerm', 'type', 'bloodGroup', 'division', 'district', 'upazila']) as IPostFilters;
+ const getAllPosts = catchAsync(async (req: Request, res: Response) => {
-   const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as IPaginationOptions;
+   const filters = pick(req.query, ['searchTerm', 'type', 'bloodGroup', 'division', 'district', 'upazila']) as IPostFilters;
- 
+   const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as IPaginationOptions;
-   const result = await PostServices.getAllPosts(filters, options);
+ 
- 
+   const result = await PostServices.getAllPosts(filters, options);
-   sendResponse(res, {
+ 
-     statusCode: httpStatus.OK,
+   sendResponse(res, {
-     success: true,
+     statusCode: httpStatus.OK,
-     message: 'Posts retrieved successfully',
+     success: true,
-     meta: result.meta,
+     message: 'Posts retrieved successfully',
-     data: result.data,
+     meta: result.meta,
-   });
+     data: result.data,
- });
+   });
- 
+ });
- const getSinglePost = catchAsync(async (req: Request, res: Response) => {
+ 
-   const result = await PostServices.getSinglePost(req.params.id as string);
+ const getSi
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [createPost, getAllPosts, getSinglePost, updatePost, deletePost]
