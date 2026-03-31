import { z } from 'zod';
import { Gender } from '../../../generated/prisma';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const addVolunteerSchema = z.object({
  body: z.object({
    contactNumber: z.string({ message: 'contactNumber is required' }),
    name: z.string().optional(),
    email: z.string().email().optional(),
    bloodGroup: z.string().transform((val) => bloodGroupMap[val] || val).optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
  }),
});

const updateDonationDateSchema = z.object({
  body: z.object({
    date: z.coerce.date({ message: 'Invalid date format' }),
  }),
});

export const OrganisationValidation = {
  addVolunteerSchema,
  updateDonationDateSchema,
};
