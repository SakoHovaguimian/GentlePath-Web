import { z } from 'zod';
export const TipPublicAuthorSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
});
export type TipPublicAuthor = z.infer<typeof TipPublicAuthorSchema>;
