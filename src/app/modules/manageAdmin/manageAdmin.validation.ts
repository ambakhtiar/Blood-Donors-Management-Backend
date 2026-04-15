import { z } from 'zod';
import { AccountStatus } from '../../../generated/prisma';

const createAdminSchema = z.object({
  body: z.object({
    name: z
      .string({ message: 'Admin name is required.' })
      .trim()
      .min(3, 'Admin name must be at least 3 characters long')
      .max(100, 'Admin name cannot exceed 100 characters'),
    email: z
      .string({ message: 'Email address is required.' })
      .email('Please provide a valid email address.')
      .trim(),
    contactNumber: z
      .string({ message: 'Contact number is required.' })
      .regex(
        /^\+8801[3-9]\d{8}$/,
        'Please provide a valid Bangladeshi phone number starting with +8801'
      )
      .trim(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(32, 'Password cannot exceed 32 characters')
      .optional(),
  }),
});

const updateAdminSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, 'Admin name must be at least 3 characters long')
      .max(100, 'Admin name cannot exceed 100 characters')
      .optional(),
    contactNumber: z
      .string()
      .regex(
        /^\+8801[3-9]\d{8}$/,
        'Please provide a valid Bangladeshi phone number starting with +8801'
      )
      .trim()
      .optional(),
    email: z
      .string()
      .email('Please provide a valid email address.')
      .trim()
      .optional(),
    division: z.string().trim().optional(),
    district: z.string().trim().optional(),
    upazila: z.string().trim().optional(),
  }),
});

const changeAdminAccessSchema = z.object({
  body: z.object({
    accountStatus: z.nativeEnum(AccountStatus, {
      message: 'Invalid account status provided.',
    }),
  }),
});

export const ManageAdminValidations = {
  createAdminSchema,
  updateAdminSchema,
  changeAdminAccessSchema,
};
