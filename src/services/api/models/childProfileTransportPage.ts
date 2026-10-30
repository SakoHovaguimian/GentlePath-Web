import { z } from 'zod';
import { ChildProfileTransportSchema } from './childProfileTransport';

export const ChildProfileTransportPageSchema = z.object({
  data: z.array(ChildProfileTransportSchema),
  page: z.object({
    hasMore: z.boolean(),
    nextOffset: z.number().int().nonnegative().nullable(),
  }),
});
