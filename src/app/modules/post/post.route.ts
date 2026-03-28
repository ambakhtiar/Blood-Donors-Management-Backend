import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { createPostSchema, updatePostSchema } from './post.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../Auth/auth.constant';
import { PostControllers } from './post.controller';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL),
  validateRequest(createPostSchema),
  PostControllers.createPost
);

router.get('/', PostControllers.getAllPosts);
router.get('/:id', PostControllers.getSinglePost);

router.patch(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  validateRequest(updatePostSchema),
  PostControllers.updatePost
);

router.delete(
  '/:id',
  auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL, USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.deletePost
);

router.patch(
  '/:id/resolve',
  auth(USER_ROLE.USER, USER_ROLE.ORGANISATION, USER_ROLE.HOSPITAL),
  PostControllers.resolvePost
);

router.patch(
  '/:id/approve',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.approvePost
);

router.patch(
  '/:id/verify',
  auth(USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN),
  PostControllers.verifyPost
);

export const PostRoutes = router;
