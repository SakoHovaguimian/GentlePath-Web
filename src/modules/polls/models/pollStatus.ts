import { z } from 'zod';
export const PollStatusSchema = z.object({ enabled: z.boolean() });
