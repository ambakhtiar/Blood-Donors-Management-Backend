import { z } from 'zod';
import { AccountStatus } from '../../../generated/prisma';

const changeUserStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(AccountStatus, { message: 'Invalid account status' }),
  }),
});

export const AdminValidation = {
  changeUserStatusSchema,
};
