import { z } from 'zod';
import { PostType } from '../../../generated/prisma';

export const createPostSchema = z.object({
  type: z.nativeEnum(PostType),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
  images: z.array(z.string()).optional(),
  bloodGroup: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  requiredDate: z.string().optional(),
  targetAmount: z.number().optional(),
});

export const updatePostSchema = z.object({
  content: z.string().min(10).optional(),
  images: z.array(z.string()).optional(),
  bloodGroup: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
  requiredDate: z.string().optional(),
  targetAmount: z.number().optional(),
  isResolved: z.boolean().optional(),
});
