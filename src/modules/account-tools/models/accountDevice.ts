import { z } from 'zod';

export const AccountDeviceTypeSchema = z.enum(['iOS', 'Android', 'Web']);
export const AccountDeviceSchema = z.object({
  id: z.string().uuid(),
  deviceType: AccountDeviceTypeSchema,
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});
export type AccountDevice = z.infer<typeof AccountDeviceSchema>;
