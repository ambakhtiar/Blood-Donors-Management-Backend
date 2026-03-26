import { z } from 'zod';
import { Gender, UserRole } from '../../../generated/prisma';

const userSignupValidationSchema = z
  .object({
    body: z.object({
      email: z.string().email('Invalid email address').optional(), // অপশনাল রাখা ভালো, কারণ সবাই ইমেইল নাও দিতে পারে
      password: z.string().min(8, 'Password must be at least 8 characters long'),
      contactNumber: z
        .string()
        .regex(
          /^\+8801[3-9]\d{8}$/,
          'Invalid Bangladeshi contact number. Must start with +8801...'
        ),
      role: z.enum(UserRole),

      donorInfo: z
        .object({
          name: z.string().min(1, 'Name is required for donors'),
          bloodGroup: z.string().min(1, 'Blood group is required'),
          gender: z.enum(Gender),
          weight: z.number().optional(),
          lastDonationDate: z.string().optional(),
          division: z.string().min(1, 'Division is required'),
          district: z.string().min(1, 'District is required'),
          upazila: z.string().min(1, 'Upazila is required'),
        })
        .optional(),

      hospitalInfo: z
        .object({
          name: z.string().min(1, 'Hospital name is required'),
          registrationNumber: z.string().optional(),
          address: z.string().optional(),
          division: z.string().min(1, 'Division is required'),
          district: z.string().min(1, 'District is required'),
          upazila: z.string().min(1, 'Upazila is required'),
        })
        .optional(),

      organisationInfo: z
        .object({
          name: z.string().min(1, 'Organisation name is required'),
          registrationNumber: z.string().optional(),
          establishedYear: z.string().optional(),
          division: z.string().min(1, 'Division is required'),
          district: z.string().min(1, 'District is required'),
          upazila: z.string().min(1, 'Upazila is required'),
        })
        .optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { role, donorInfo, hospitalInfo, organisationInfo } = data.body;

    if (role === 'USER' && !donorInfo) {
      ctx.addIssue({
        code: 'custom',
        message: 'donorInfo is required for role USER',
        path: ['body', 'donorInfo'],
      });
    }

    if (role === 'HOSPITAL' && !hospitalInfo) {
      ctx.addIssue({
        code: 'custom',
        message: 'hospitalInfo is required for role HOSPITAL',
        path: ['body', 'hospitalInfo'],
      });
    }

    if (role === 'ORGANISATION' && !organisationInfo) {
      ctx.addIssue({
        code: 'custom',
        message: 'organisationInfo is required for role ORGANISATION',
        path: ['body', 'organisationInfo'],
      });
    }
  });


const userLoginValidationSchema = z.object({
  body: z.object({
    contactNumber: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(1, 'Password is required'),
  }),
}).superRefine((data, ctx) => {
  if (!data.body.contactNumber && !data.body.email) {
    ctx.addIssue({
      code: 'custom',
      message: 'Either contactNumber or email is required for login',
      path: ['body'],
    });
  }
});

export const AuthValidation = {
  userSignupValidationSchema,
  userLoginValidationSchema,
};