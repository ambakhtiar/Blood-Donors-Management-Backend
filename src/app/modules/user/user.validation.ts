import { z } from 'zod';

const locationSchema = {
  division: z.string().trim().optional(),
  district: z.string().trim().optional(),
  upazila: z.string().trim().optional(),
  area: z.string().trim().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
};

const updateProfileSchema = z.object({
  body: z.object({
    ...locationSchema,
    email: z
      .string()
      .email('Please provide a valid email address')
      .trim()
      .optional(),
    contactNumber: z
      .string()
      .regex(
        /^\+8801[3-9]\d{8}$/,
        'Please provide a valid Bangladeshi phone number starting with +8801'
      )
      .trim()
      .optional(),
    profilePictureUrl: z.string().url('Please provide a valid URL for the profile picture').optional().or(z.literal('')),
    // Donor specific fields at root for convenience
    name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters').optional(),
    weight: z.coerce.number().min(40, 'Weight must be at least 40 kg').max(200, 'Weight seems out of range').optional(),
    lastDonationDate: z.coerce.date().optional(),
    isAvailableForDonation: z.boolean().optional(),
    // Hospital/Organisation specific fields at root
    registrationNumber: z.string().trim().optional(),
    address: z.string().trim().optional(),
    establishedYear: z.string().trim().optional(),

    donorProfile: z
      .object({
        name: z.string().trim().min(2, 'Name must be at least 2 characters long').max(100, 'Name cannot exceed 100 characters').optional(),
        weight: z.coerce.number().min(40, 'Weight must be at least 40 kg').max(200, 'Weight seems out of range').optional(),
        lastDonationDate: z.coerce.date().optional(),
        isAvailableForDonation: z.boolean().optional(),
        ...locationSchema,
      })
      .optional(),
    hospital: z
      .object({
        name: z.string().trim().min(3, 'Hospital name must be at least 3 characters long').max(150, 'Hospital name cannot exceed 150 characters').optional(),
        registrationNumber: z.string().trim().optional(),
        address: z.string().trim().optional(),
        ...locationSchema,
      })
      .optional(),
    organisation: z
      .object({
        name: z.string().trim().min(2, 'Organisation name must be at least 2 characters long').max(150, 'Organisation name cannot exceed 150 characters').optional(),
        registrationNumber: z.string().trim().optional(),
        establishedYear: z.string().trim().optional(),
        ...locationSchema,
      })
      .optional(),
  }),
});

export const UserValidations = {
  updateProfileSchema,
};