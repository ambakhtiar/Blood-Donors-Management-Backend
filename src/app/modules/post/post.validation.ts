import { z } from 'zod';
import { PostType } from '../../../generated/prisma';

export const createPostSchema = z.discriminatedUnion('type', [
  // BLOOD_FINDING Validation
  z.object({
    type: z.literal(PostType.BLOOD_FINDING),
    content: z.string().optional(),
    images: z.array(z.string()).optional(),
    bloodGroup: z.string().min(1, 'Blood group is required'),
    bloodBags: z.number().int({ message: 'Blood bags count must be an integer' }),
    reason: z.string().min(1, 'Reason is required'),
    donationTime: z.string().datetime({ message: 'Invalid date-time format' }),
    contactNumber: z.string().min(1, 'Contact number is required'),
    location: z.string().optional(),
    division: z.string().optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    area: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).refine((data) => data.location || (data.division && data.district && data.upazila), {
    message: 'Either raw location or division/district/upazila must be provided',
    path: ['location'],
  }),

  // BLOOD_DONATION Validation
  z.object({
    type: z.literal(PostType.BLOOD_DONATION),
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    images: z.array(z.string()).optional(),
    bloodGroup: z.string().min(1, 'Blood group is required'),
    donationTime: z.string().datetime({ message: 'Invalid date-time format' }),
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
    title: z.string().min(1, 'Title is required'),
    content: z.string().optional(),
    images: z.array(z.string()).optional(),
    reason: z.string().min(1, 'Reason (why funds needed) is required'),
    medicalIssues: z.string().min(1, 'Medical issues description is required'),
    contactNumber: z.string().min(1, 'Contact number is required'),
    targetAmount: z.number({ message: 'Target amount must be a number' }),
    location: z.string().min(1, 'Patient location/address is required'),
    bkashNagadNumber: z.string().min(1, 'Bkash/Nagad number is required'),
    division: z.string().optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    area: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
]);

export const updatePostSchema = z.object({
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
  bloodGroup: z.string().optional(),
  bloodBags: z.number().optional(),
  reason: z.string().optional(),
  donationTime: z.string().datetime().optional(),
  hemoglobin: z.number().optional(),
  medicalIssues: z.string().optional(),
  targetAmount: z.number().optional(),
  bkashNagadNumber: z.string().optional(),
  isResolved: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});
