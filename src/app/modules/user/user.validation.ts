import { z } from 'zod';
import { Gender } from '../../../generated/prisma';
import { bloodGroupMap } from '../../helpers/bloodGroup';

const locationSchema = {
    division: z.string().optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    area: z.string().optional(),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
};

const updateProfileSchema = z.object({
    body: z.object({
        ...locationSchema,
        email: z.string().email().optional(),
        contactNumber: z.string().optional(),
        // Donor specific fields at root for convenience
        name: z.string().optional(),
        weight: z.coerce.number().optional(),
        lastDonationDate: z.coerce.date().optional(),
        isAvailableForDonation: z.boolean().optional(),
        // Hospital/Organisation specific fields at root
        registrationNumber: z.string().optional(),
        address: z.string().optional(),
        establishedYear: z.string().optional(),

        donorProfile: z.object({
            name: z.string().optional(),
            weight: z.coerce.number().optional(),
            lastDonationDate: z.coerce.date().optional(),
            isAvailableForDonation: z.boolean().optional(),
            ...locationSchema,
        }).optional(),
        hospital: z.object({
            name: z.string().optional(),
            registrationNumber: z.string().optional(),
            address: z.string().optional(),
            ...locationSchema,
        }).optional(),
        organisation: z.object({
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