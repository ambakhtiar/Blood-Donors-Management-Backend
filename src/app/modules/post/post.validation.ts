import { z } from 'zod';
import { PostType, DonationTimeType } from '../../../generated/prisma';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const BloodGroupEnum = z.string().transform((val, ctx) => {
    const mapped = bloodGroupMap[val as keyof typeof bloodGroupMap];
    if (!mapped) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Invalid blood group format. Use A+, A-, B+, B-, AB+, AB-, O+, O-`,
        });
        return z.NEVER;
    }
    return mapped;
});

export const createPostSchema = z.object({
    body: z.discriminatedUnion('type', [
        // BLOOD_FINDING Validation
        z
            .object({
                type: z.literal(PostType.BLOOD_FINDING),
                content: z.string().trim().optional(),
                images: z.array(z.string().url('Image must be a valid URL')).optional(),
                bloodGroup: BloodGroupEnum.optional(),
                bloodBags: z.coerce
                    .number({ message: 'Number of blood bags is required and must be a number' })
                    .int('Number of blood bags must be an integer')
                    .min(1, 'At least 1 blood bag must be requested')
                    .max(10, 'Cannot request more than 10 blood bags at once'),
                reason: z
                    .string({ message: 'Please specify the reason for needing blood' })
                    .trim()
                    .min(5, 'Reason must be at least 5 characters long')
                    .max(500, 'Reason cannot exceed 500 characters'),
                donationTimeType: z
                    .nativeEnum(DonationTimeType, {
                        message: 'Please specify a valid donation time type (e.g., EMERGENCY, FIXED, ANYTIME)',
                    })
                    .optional()
                    .default(DonationTimeType.EMERGENCY),
                donationTime: z.coerce.date().optional(),
                contactNumber: z
                    .string({ message: 'A contact number is required' })
                    .regex(
                        /^\+8801[3-9]\d{8}$/,
                        'Please provide a valid Bangladeshi phone number starting with +8801'
                    )
                    .trim(),
                location: z.string().trim().optional(),
                division: z.string().trim().optional(),
                district: z.string().trim().optional(),
                upazila: z.string().trim().optional(),
                area: z.string().trim().optional(),
                latitude: z.coerce.number().optional(),
                longitude: z.coerce.number().optional(),
            })
            .refine((data) => data.location || (data.division && data.district && data.upazila), {
                message: 'Please provide either a full address (location) or select division, district, and upazila',
                path: ['location'],
            })
            .refine(
                (data) =>
                    !data.donationTimeType || data.donationTimeType !== DonationTimeType.FIXED || data.donationTime,
                {
                    message: 'Donation time is mandatory when time type is FIXED',
                    path: ['donationTime'],
                }
            ),

        // BLOOD_DONATION Validation
        z.object({
            type: z.literal(PostType.BLOOD_DONATION),
            title: z
                .string({ message: 'Title is required for the donation post' })
                .trim()
                .min(5, 'Title must be at least 5 characters long')
                .max(100, 'Title cannot exceed 100 characters'),
            content: z.string().trim().optional(),
            images: z.array(z.string().url('Image must be a valid URL')).optional(),
            bloodGroup: BloodGroupEnum.optional(),
            donationTime: z.coerce.date({
                message: 'Please specify a valid date for when you are available to donate',
            }),
            contactNumber: z
                .string({ message: 'A contact number is required' })
                .regex(
                    /^\+8801[3-9]\d{8}$/,
                    'Please provide a valid Bangladeshi phone number starting with +8801'
                )
                .trim(),
            location: z.string().trim().optional(),
            division: z.string().trim().optional(),
            district: z.string().trim().optional(),
            upazila: z.string().trim().optional(),
            area: z.string().trim().optional(),
            latitude: z.coerce.number().optional(),
            longitude: z.coerce.number().optional(),
        }),

        // HELPING Validation
        z.object({
            type: z.literal(PostType.HELPING),
            title: z
                .string({ message: 'Campaign title is required' })
                .trim()
                .min(5, 'Title must be at least 5 characters long')
                .max(150, 'Title cannot exceed 150 characters'),
            content: z.string().trim().optional(),
            images: z.array(z.string().url('Image must be a valid URL')).optional(),
            reason: z
                .string({ message: 'Please specify why funds are needed' })
                .trim()
                .min(10, 'Reason must be at least 10 characters long')
                .max(1000, 'Reason description is too long'),
            medicalIssues: z
                .string({ message: 'Please describe the medical issues' })
                .trim()
                .min(10, 'Medical description must be at least 10 characters long')
                .max(2000, 'Medical description is too long'),
            contactNumber: z
                .string({ message: 'A contact number is required' })
                .regex(
                    /^\+8801[3-9]\d{8}$/,
                    'Please provide a valid Bangladeshi phone number starting with +8801'
                )
                .trim(),
            targetAmount: z.coerce
                .number({ message: 'Target fund amount is required and must be a number' })
                .min(100, 'Target amount must be at least 100 BDT'),
            location: z
                .string({ message: 'Patient location/hospital name is required' })
                .trim()
                .min(3, 'Location description must be at least 3 characters'),
            bkashNagadNumber: z
                .string({ message: 'bKash/Nagad number is required for receiving funds' })
                .regex(
                    /^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/,
                    'Please provide a valid Bangladeshi mobile banking number'
                )
                .trim(),
            division: z.string().trim().optional(),
            district: z.string().trim().optional(),
            upazila: z.string().trim().optional(),
            area: z.string().trim().optional(),
            latitude: z.coerce.number().optional(),
            longitude: z.coerce.number().optional(),
        }),
    ]),
});

export const updatePostSchema = z.object({
    body: z.object({
        title: z.string().trim().min(5, 'Title must be at least 5 characters long').max(150).optional(),
        content: z.string().trim().optional(),
        images: z.array(z.string().url('Image must be a valid URL')).optional(),
        contactNumber: z
            .string()
            .regex(
                /^\+8801[3-9]\d{8}$/,
                'Please provide a valid Bangladeshi phone number starting with +8801'
            )
            .trim()
            .optional(),
        location: z.string().trim().optional(),
        division: z.string().trim().optional(),
        district: z.string().trim().optional(),
        upazila: z.string().trim().optional(),
        area: z.string().trim().optional(),
        latitude: z.coerce.number().optional(),
        longitude: z.coerce.number().optional(),
        bloodGroup: z.string().transform((val) => bloodGroupMap[val as keyof typeof bloodGroupMap] || val).optional(),
        bloodBags: z.coerce.number().int().min(1).max(50).optional(),
        reason: z.string().trim().min(5).max(1000).optional(),
        donationTimeType: z.nativeEnum(DonationTimeType).optional(),
        donationTime: z.coerce.date().optional(),
        hemoglobin: z.coerce.number().min(0).max(30).optional(),
        medicalIssues: z.string().trim().min(5).max(2000).optional(),
        targetAmount: z.coerce.number().min(100).optional(),
        bkashNagadNumber: z
            .string()
            .regex(
                /^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/,
                'Please provide a valid Bangladeshi mobile banking number'
            )
            .trim()
            .optional(),
        isResolved: z.boolean().optional(),
        isVerified: z.boolean().optional(),
    }),
});
