import { z } from 'zod';
import { Gender, RequestStatus } from '../../../generated/prisma';

const recordDonationSchema = z.object({
  body: z.object({
    contactNumber: z.string({ message: 'contactNumber is required' }),
    name: z.string().optional(),
    bloodGroup: z.string().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
    weight: z.number().optional(),
    createPost: z.boolean().optional(),
    postContent: z.string().optional(),
  }),
});

const updateRequestStatusSchema = z.object({
  body: z.object({
    status: z.enum([RequestStatus.ACCEPTED, RequestStatus.REJECTED], {
      message: 'Status is required and must be ACCEPTED or REJECTED',
    }),
  }),
});

export const HospitalValidation = {
  recordDonationSchema,
  updateRequestStatusSchema,
};
