import { z } from 'zod';
import { Gender } from '../../../generated/prisma';
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
            .string({ message: 'Name is required' })
            .trim()
            .min(3, 'Name must be at least 3 characters long')
            .max(100, 'Name cannot exceed 100 characters'),
        bloodGroup: z
            .string({ message: 'Blood group is required' })
            .transform((val) => bloodGroupMap[val as keyof typeof bloodGroupMap] || val),
        gender: z
            .enum([Gender.MALE, Gender.FEMALE], {
                message: 'Gender must be MALE or FEMALE',
            }),
        division: z.string().trim().optional(),
        district: z.string().trim().optional(),
        upazila: z.string().trim().optional(),
        createPost: z.boolean().optional(),
        postTitle: z.string().trim().optional(),
        postImages: z.array(z.string().url()).optional(),
        postContent: z.string().trim().optional(),
    }),
});

const updateDonationRecordSchema = z.object({
    body: z.object({
        name: z.string().trim().min(3, 'Name is too short').max(100).optional(),
        contactNumber: z.string().regex(/^\+8801[3-9]\d{8}$/, 'Must be valid BD number').trim().optional(),
        division: z.string().trim().optional(),
        district: z.string().trim().optional(),
        upazila: z.string().trim().optional(),
        createPost: z.boolean().optional(),
        postTitle: z.string().trim().optional(),
        postImages: z.array(z.string().url()).optional(),
        postContent: z.string().trim().optional(),
    }),
});

export const HospitalValidation = {
    recordDonationSchema,
    updateDonationRecordSchema,
};
