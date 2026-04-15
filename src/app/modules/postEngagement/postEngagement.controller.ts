import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PostEngagementServices } from './postEngagement.service';
import { JwtPayload } from 'jsonwebtoken';

const toggleLike = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await PostEngagementServices.toggleLike(user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.liked ? 'Post liked successfully' : 'Post unliked successfully',
    data: result,
  });
});

const addComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const result = await PostEngagementServices.addComment(user.userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment added successfully',
    data: result,
  });
});

const getPostComments = catchAsync(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const result = await PostEngagementServices.getPostComments(postId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

const editComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const commentId = req.params.commentId as string;
  const result = await PostEngagementServices.editComment(commentId, user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment updated successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const commentId = req.params.commentId as string;
  await PostEngagementServices.deleteComment(commentId, user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: null,
  });
});

export const PostEngagementControllers = {
  toggleLike,
  addComment,
  getPostComments,
  editComment,
  deleteComment,
};
