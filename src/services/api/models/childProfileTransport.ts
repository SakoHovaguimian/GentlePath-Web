import { z } from 'zod';

export const ChildProfileTransportSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  date_of_birth: z.string(),
});

export type ChildProfileTransport = z.infer<typeof ChildProfileTransportSchema>;
