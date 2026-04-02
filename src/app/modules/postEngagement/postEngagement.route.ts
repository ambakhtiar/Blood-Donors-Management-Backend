import { Router } from 'express';
import auth from '../../middlewares/auth';
import { UserRole } from '../../../generated/prisma';
import validateRequest from '../../middlewares/validateRequest';
import { PostEngagementValidations } from './postEngagement.validation';
import { PostEngagementControllers } from './postEngagement.controller';

const router = Router();

router.post(
  '/like',
  auth(UserRole.USER, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(PostEngagementValidations.toggleLikeSchema),
  PostEngagementControllers.toggleLike
);

router.post(
  '/comment',
  auth(UserRole.USER, UserRole.HOSPITAL, UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(PostEngagementValidations.addCommentSchema),
  PostEngagementControllers.addComment
);

router.get(
  '/:postId/comments',
  PostEngagementControllers.getPostComments
);

export const PostEngagementRoutes = router;
