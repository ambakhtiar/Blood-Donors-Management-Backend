import { z } from 'zod';
import { Gender } from '../../../generated/prisma';

const locationSchema = {
    division: z.string().optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    area: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
};

const updateProfileSchema = z.object({
    body: z.object({
        ...locationSchema,
        email: z.string().email().optional(),
        contactNumber: z.string().optional(),
        donorInfo: z.object({
            name: z.string().optional(),
            bloodGroup: z.string().optional(),
            gender: z.nativeEnum(Gender).optional(),
            weight: z.number().optional(),
            lastDonationDate: z.string().datetime().optional(),
            isAvailableForDonation: z.boolean().optional(),
            ...locationSchema,
        }).optional(),
        hospitalInfo: z.object({
            name: z.string().optional(),
            registrationNumber: z.string().optional(),
            address: z.string().optional(),
            ...locationSchema,
        }).optional(),
        organisationInfo: z.object({
            name: z.string().optional(),
            registrationNumber: z.string().optional(),
            establishedYear: z.string().optional(),
            ...locationSchema,
        }).optional(),
    }),
});

export const UserValidations = {
    updateProfileSchema,
};