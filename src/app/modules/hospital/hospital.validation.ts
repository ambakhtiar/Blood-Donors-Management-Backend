import { z } from 'zod';
import { Gender, RequestStatus } from '../../../generated/prisma';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const recordDonationSchema = z.object({
  body: z.object({
    contactNumber: z
      .string({ message: 'Contact number is required' })
      .regex(
        /^\+8801[3-9]\d{8}$/,
        'Please provide a valid Bangladeshi phone number starting with +8801'
      )
      .trim(),
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters long')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    bloodGroup: z
      .string()
      .transform((val) => bloodGroupMap[val as keyof typeof bloodGroupMap] || val)
      .optional(),
    gender: z
      .enum([Gender.MALE, Gender.FEMALE], {
        message: 'Gender must be MALE or FEMALE',
      })
      .optional(),
    weight: z.coerce
      .number()
      .min(40, 'Weight must be at least 40 kg to donate blood')
      .max(200, 'Weight seems out of range')
      .optional(),
    createPost: z.boolean().optional(),
    postContent: z.string().trim().optional(),
  }),
});

const updateRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum([RequestStatus.ACCEPTED, RequestStatus.REJECTED], {
      message: 'Status must be either ACCEPTED or REJECTED',
    }),
  }),
});

export const HospitalValidation = {
  recordDonationSchema,
  updateRequestStatusSchema,
};
