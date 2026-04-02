import { z } from 'zod';
import { AccountStatus } from '../../../generated/prisma';

const changeUserStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(AccountStatus, {
      message: 'Please provide a valid account status (e.g. ACTIVE, BLOCKED)',
    }),
  }),
});

export const AdminValidation = {
  changeUserStatusSchema,
};
