import { z } from 'zod';
import { gentlePathEditorialStrings as copy } from '@/strings';

export const GuideOrderSchema = z
  .object({
    item_ids: z.array(z.uuid()).min(1).max(100),
  })
  .refine(
    (input) => new Set(input.item_ids).size === input.item_ids.length,
    copy.validation.itemOwnershipDescription,
  );
export type GuideOrder = z.infer<typeof GuideOrderSchema>;
