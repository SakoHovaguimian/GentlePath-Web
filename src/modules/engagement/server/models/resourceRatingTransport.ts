import { z } from 'zod';
export const ResourceRatingTransportSchema = z.object({
  resource_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});
