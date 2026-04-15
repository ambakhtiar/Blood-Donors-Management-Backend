import { z } from 'zod';

const addCommentSchema = z.object({
  body: z.object({
    postId: z
      .string({ message: 'Post ID is required' })
      .trim()
      .min(1, 'Post ID cannot be empty'),
    content: z
      .string({ message: 'Please write a comment' })
      .trim()
      .min(1, 'Comment cannot be empty')
      .max(1000, 'Comment is too long (maximum 1000 characters)'),
    parentId: z
      .string()
      .trim()
      .min(1, 'Parent Comment ID cannot be empty')
      .optional(),
  }),
});

const editCommentSchema = z.object({
  body: z.object({
    content: z
      .string({ message: 'Please write a comment' })
      .trim()
      .min(1, 'Comment cannot be empty')
      .max(1000, 'Comment is too long (maximum 1000 characters)'),
  }),
});

const toggleLikeSchema = z.object({
  body: z.object({
    postId: z
      .string({ message: 'Post ID is required' })
      .trim()
      .min(1, 'Post ID cannot be empty'),
  }),
});

export const PostEngagementValidations = {
  addCommentSchema,
  editCommentSchema,
  toggleLikeSchema,
};
