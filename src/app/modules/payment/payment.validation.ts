import { z } from 'zod';

const initiateDonationSchema = z.object({
  body: z.object({
    postId: z.string({ message: 'Post ID is required' }),
    amount: z.coerce.number({ message: 'Amount must be a number' }).positive('Amount must be positive'),
  }),
});

export const PaymentValidation = {
  initiateDonationSchema,
};
