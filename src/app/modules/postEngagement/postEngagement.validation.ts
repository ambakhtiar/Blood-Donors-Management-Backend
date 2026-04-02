import { z } from 'zod';

const addCommentSchema = z.object({
  body: z.object({
    postId: z.string({ message: 'Post ID is required' }).uuid({ message: 'Invalid Post ID format' }),
    content: z.string({ message: 'Comment content is required' }).min(1, 'Comment content cannot be empty'),
    parentId: z.string({ message: 'Parent Comment ID must be a string' }).uuid({ message: 'Invalid Parent Comment ID format' }).optional(),
  }),
});

const toggleLikeSchema = z.object({
  body: z.object({
    postId: z.string({ message: 'Post ID is required' }).uuid({ message: 'Invalid Post ID format' }),
  }),
});

export const PostEngagementValidations = {
  addCommentSchema,
  toggleLikeSchema,
};
