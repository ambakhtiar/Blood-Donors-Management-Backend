import { z } from 'zod';
import { AccountStatus } from '../../../generated/prisma';

const createAdminSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required.' }).min(1, 'Name is required.'),
    email: z.string({ message: 'Email is required.' }).email('Invalid email address.'),
    contactNumber: z.string({ message: 'Contact Number is required.' }).min(1, 'Contact Number is required.'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  }),
});

const updateAdminSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    contactNumber: z.string().optional(),
  }),
});

const changeAdminAccessSchema = z.object({
  body: z.object({
    accountStatus: z.enum([AccountStatus.ACTIVE, AccountStatus.BLOCKED]),
  }),
});

export const ManageAdminValidations = {
  createAdminSchema,
  updateAdminSchema,
  changeAdminAccessSchema,
};
