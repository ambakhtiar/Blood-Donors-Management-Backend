import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../errors/AppError';
import { ICommentPayload, IToggleLikePayload } from './postEngagement.interface';

const userSelect = {
  id: true,
  email: true,
  contactNumber: true,
  profilePictureUrl: true,
  donorProfile: { select: { name: true } },
  admin: { select: { name: true } },
  superAdmin: { select: { name: true } },
  hospital: { select: { name: true } },
  organisation: { select: { name: true } }
};

const toggleLike = async (userId: string, payload: IToggleLikePayload) => {
  const { postId } = payload;

  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post you are trying to like was not found. It may have been deleted.');
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });
    return { liked: false };
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
    return { liked: true };
  }
};

const addComment = async (userId: string, payload: ICommentPayload) => {
  const { postId, content, parentId } = payload;

  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'The post you are trying to comment on was not found. It may have been deleted.');
  }

  if (parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentId },
    });
    if (!parentComment) {
      throw new AppError(httpStatus.NOT_FOUND, 'The comment you are trying to reply to was not found. It may have been deleted.');
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId,
      parentId,
    },
    include: {
      user: {
        select: userSelect
      }
    }
  });

  return comment;
};

const getPostComments = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId, isDeleted: false },
  });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found. It may have been deleted or the ID is incorrect.');
  }

  const comments = await prisma.comment.findMany({
    where: {
      postId,
      parentId: null,
    },
    include: {
      user: { select: userSelect },
      replies: {
        include: {
          user: { select: userSelect }
        },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return comments;
};

export const PostEngagementServices = {
  toggleLike,
  addComment,
  getPostComments,
};
