import { z } from 'zod';

export const ChildSupportDetailsTransportSchema = z.object({
  allergies: z.string().default(''),
  communication: z.string().default(''),
  sensory_needs: z.string().default(''),
  comfort_strategies: z.string().default(''),
  daily_routines: z.string().default(''),
});

export type ChildSupportDetailsTransport = z.infer<
  typeof ChildSupportDetailsTransportSchema
>;
