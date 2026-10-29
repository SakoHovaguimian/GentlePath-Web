import { z } from 'zod';
import { AccountToolsPagingSchema } from './accountToolsPaging';
import { AccountDeviceTypeSchema } from './accountDevice';

export const AccountDeviceQuerySchema = AccountToolsPagingSchema.extend({
  query: z.string().trim().max(500).default(''),
  deviceType: AccountDeviceTypeSchema.optional(),
}).strict();
export type AccountDeviceQuery = z.infer<typeof AccountDeviceQuerySchema>;
