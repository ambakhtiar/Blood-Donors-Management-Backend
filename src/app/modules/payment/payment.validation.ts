import { z } from 'zod';

const initiateDonationSchema = z.object({
  body: z.object({
    postId: z
      .string({ message: 'Post ID is required' })
      .trim()
      .min(1, 'Post ID cannot be empty'),
    amount: z.coerce
      .number({ message: 'Donation amount is required and must be a number' })
      .positive('Donation amount must be greater than zero')
      .min(10, 'Minimum donation amount is 10 BDT'),
  }),
});

export const PaymentValidation = {
  initiateDonationSchema,
};
