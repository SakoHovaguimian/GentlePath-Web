import { z } from 'zod';
export const AccountActivitySchema = z.enum(['all', 'active', 'disabled']);
export type AccountActivity = z.infer<typeof AccountActivitySchema>;
