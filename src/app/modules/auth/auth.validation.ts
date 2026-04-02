import { z } from 'zod';
import { Gender, UserRole } from '../../../generated/prisma';

const userSignupValidationSchema = z
  .object({
    body: z.object({
      email: z
        .string({ message: 'Email must be text' })
        .email('Please provide a valid email address')
        .trim()
        .optional(),
      password: z
        .string({ message: 'Password is required' })
        .min(6, 'Password must be at least 6 characters long')
        .max(32, 'Password cannot exceed 32 characters'),
      contactNumber: z
        .string({ message: 'Contact number is required' })
        .regex(
          /^\+8801[3-9]\d{8}$/,
          'Please provide a valid Bangladeshi phone number starting with +8801'
        )
        .trim(),
      role: z.nativeEnum(UserRole, {
        message: 'Please select a valid user role',
      }),

      donorInfo: z
        .object({
          name: z
            .string({ message: 'Full name is required' })
            .trim()
            .min(3, 'Name must be at least 3 characters long')
            .max(100, 'Name cannot exceed 100 characters'),
          bloodGroup: z
            .string({ message: 'Blood group is required' })
            .trim()
            .min(1, 'Blood group is required'),
          gender: z.nativeEnum(Gender, {
            message: 'Please select a valid gender',
          }),
          weight: z.coerce
            .number()
            .min(40, 'Weight must be at least 40 kg to donate blood')
            .max(200, 'Weight seems out of range')
            .optional(),
          lastDonationDate: z.coerce.date().optional(),
          division: z
            .string({ message: 'Division is required' })
            .trim()
            .min(1, 'Please select a division'),
          district: z
            .string({ message: 'District is required' })
            .trim()
            .min(1, 'Please select a district'),
          upazila: z
            .string({ message: 'Upazila is required' })
            .trim()
            .min(1, 'Please select an upazila'),
        })
        .optional(),

      hospitalInfo: z
        .object({
          name: z
            .string({ message: 'Hospital name is required' })
            .trim()
            .min(3, 'Hospital name must be at least 3 characters long')
            .max(150, 'Hospital name cannot exceed 150 characters'),
          registrationNumber: z.string().trim().optional(),
          address: z.string().trim().optional(),
          division: z
            .string({ message: 'Division is required' })
            .trim()
            .min(1, 'Please select a division'),
          district: z
            .string({ message: 'District is required' })
            .trim()
            .min(1, 'Please select a district'),
          upazila: z
            .string({ message: 'Upazila is required' })
            .trim()
            .min(1, 'Please select an upazila'),
        })
        .optional(),

      organisationInfo: z
        .object({
          name: z
            .string({ message: 'Organisation name is required' })
            .trim()
            .min(3, 'Organisation name must be at least 3 characters long')
            .max(150, 'Organisation name cannot exceed 150 characters'),
          registrationNumber: z.string().trim().optional(),
          establishedYear: z.string().trim().optional(),
          division: z
            .string({ message: 'Division is required' })
            .trim()
            .min(1, 'Please select a division'),
          district: z
            .string({ message: 'District is required' })
            .trim()
            .min(1, 'Please select a district'),
          upazila: z
            .string({ message: 'Upazila is required' })
            .trim()
            .min(1, 'Please select an upazila'),
        })
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { role, donorInfo, hospitalInfo, organisationInfo } = data.body;

    if (role === 'USER' && !donorInfo) {
      ctx.addIssue({
        code: 'custom',
        message: 'Donor information is required when registering as a regular user.',
        path: ['body', 'donorInfo'],
      });
    }

    if (role === 'HOSPITAL' && !hospitalInfo) {
      ctx.addIssue({
        code: 'custom',
        message: 'Hospital information is required when registering as a hospital.',
        path: ['body', 'hospitalInfo'],
      });
    }

    if (role === 'ORGANISATION' && !organisationInfo) {
      ctx.addIssue({
        code: 'custom',
        message: 'Organisation information is required when registering as an organisation.',
        path: ['body', 'organisationInfo'],
      });
    }
  });

const userLoginValidationSchema = z
  .object({
    body: z.object({
      contactNumber: z.string().trim().optional(),
      email: z.string().email('Please provide a valid email address').trim().optional(),
      password: z
        .string({ message: 'Password is required' })
        .min(1, 'Please enter your password'),
    }),
  })
  .superRefine((data, ctx) => {
    if (!data.body.contactNumber && !data.body.email) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please provide either your contact number or email address to log in.',
        path: ['body'],
      });
    }
  });

export const AuthValidation = {
  userSignupValidationSchema,
  userLoginValidationSchema,
};