import { z } from 'zod';
import { Gender } from '../../../generated/prisma';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const addVolunteerSchema = z.object({
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
    email: z
      .string()
      .email('Please provide a valid email address')
      .trim()
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
  }),
});

const updateDonationDateSchema = z.object({
  body: z.object({
    date: z.coerce.date({
      message: 'Please specify a valid donation date',
    }).optional(),
    donationDate: z.coerce.date({
      message: 'Please specify a valid donation date',
    }).optional(),
  }).refine(data => data.date || data.donationDate, {
    message: 'Either date or donationDate must be provided',
    path: ['date'],
  }),
});

const updateVolunteerSchema = z.object({
  body: z.object({
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
    division: z.string().optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
  }),
});

export const OrganisationValidation = {
  addVolunteerSchema,
  updateDonationDateSchema,
  updateVolunteerSchema,
};
