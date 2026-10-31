import { z } from 'zod';
import { ServiceApplicationSchema } from './serviceApplication';
import { ApplicationFollowUpSchema } from './applicationFollowUp';
const PageMetadataSchema = z.object({
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  hasMore: z.boolean(),
  nextOffset: z.number().int().nonnegative().nullable(),
});

export const ApplicationPageSchema = z.object({
  data: z.array(ServiceApplicationSchema),
  page: PageMetadataSchema,
});
export const ApplicationPriorityPageSchema = z.object({
  data: z.array(ApplicationFollowUpSchema),
  page: PageMetadataSchema,
});
