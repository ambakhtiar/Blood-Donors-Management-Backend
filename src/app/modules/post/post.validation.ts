import { z } from 'zod';
import { PostType, DonationTimeType } from '../../../generated/prisma';
import { bloodGroupMap } from '../../helpers/bloodGroup.utils';

const BloodGroupEnum = z.string().transform((val, ctx) => {
  const mapped = bloodGroupMap[val];
  if (!mapped) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid blood group group format. Use A+, A-, B+, B-, AB+, AB-, O+, O-`,
    });
    return z.NEVER;
  }
  return mapped;
});

export const createPostSchema = z.object({
  body: z.union([
    // BLOOD_FINDING Validation
    z.object({
      type: z.literal(PostType.BLOOD_FINDING),
      content: z.string().optional(),
      images: z.array(z.string()).optional(),
      bloodGroup: BloodGroupEnum,
      bloodBags: z.number({ message: 'Blood bags count is required' }).int({ message: 'Blood bags count must be an integer' }),
      reason: z.string({ message: 'Reason is required' }).min(1, 'Reason is required'),
      donationTimeType: z.nativeEnum(DonationTimeType, { message: 'Donation time type is required' }),
      donationTime: z.string().datetime({ message: 'Invalid date-time format (ISO 8601)' }).optional(),
      contactNumber: z.string({ message: 'Contact number is required' }).min(1, 'Contact number is required'),
      location: z.string().optional(),
      division: z.string().optional(),
      district: z.string().optional(),
      upazila: z.string().optional(),
      area: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
      .refine((data) => data.location || (data.division && data.district && data.upazila), {
        message: 'Either raw location or division/district/upazila must be provided',
        path: ['location'],
      })
      .refine((data) => data.donationTimeType !== DonationTimeType.FIXED || data.donationTime, {
        message: 'Donation time is required when donationTimeType is FIXED',
        path: ['donationTime'],
      }),

    // BLOOD_DONATION Validation
    z.object({
      type: z.literal(PostType.BLOOD_DONATION),
      title: z.string({ message: 'Title is required' }).min(1, 'Title is required'),
      content: z.string().optional(),
      images: z.array(z.string()).optional(),
      bloodGroup: BloodGroupEnum,
      donationTime: z.string({ message: 'Donation time is required' }).datetime({ message: 'Invalid date-time format (ISO 8601)' }),
      location: z.string().optional(),
      division: z.string().optional(),
      district: z.string().optional(),
      upazila: z.string().optional(),
      area: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),

    // HELPING Validation
    z.object({
      type: z.literal(PostType.HELPING),
      title: z.string({ message: 'Title is required' }).min(1, 'Title is required'),
      content: z.string().optional(),
      images: z.array(z.string()).optional(),
      reason: z.string({ message: 'Reason is required' }).min(1, 'Reason (why funds needed) is required'),
      medicalIssues: z.string({ message: 'Medical issues is required' }).min(1, 'Medical issues description is required'),
      contactNumber: z.string({ message: 'Contact number is required' }).min(1, 'Contact number is required'),
      targetAmount: z.number({ message: 'Target amount is required' }),
      location: z.string({ message: 'Patient location is required' }).min(1, 'Patient location/address is required'),
      bkashNagadNumber: z.string({ message: 'Bkash/Nagad number is required' }).min(1, 'Bkash/Nagad number is required'),
      division: z.string().optional(),
      district: z.string().optional(),
      upazila: z.string().optional(),
      area: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
  ]),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    images: z.array(z.string()).optional(),
    contactNumber: z.string().optional(),
    location: z.string().optional(),
    division: z.string().optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    area: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    bloodGroup: z.string().transform((val) => bloodGroupMap[val] || val).optional(),
    bloodBags: z.number().optional(),
    reason: z.string().optional(),
    donationTimeType: z.nativeEnum(DonationTimeType).optional(),
    donationTime: z.string().datetime().optional(),
    hemoglobin: z.number().optional(),
    medicalIssues: z.string().optional(),
    targetAmount: z.number().optional(),
    bkashNagadNumber: z.string().optional(),
    isResolved: z.boolean().optional(),
    isVerified: z.boolean().optional(),
  }),
});
