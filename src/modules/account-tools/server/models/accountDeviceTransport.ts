import { z } from 'zod';
import { AccountDeviceTypeSchema } from '../../models/accountDevice';

export const AccountDeviceTransportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  device_token: z.string(),
  device_type: AccountDeviceTypeSchema,
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});
export type AccountDeviceTransport = z.infer<
  typeof AccountDeviceTransportSchema
>;
