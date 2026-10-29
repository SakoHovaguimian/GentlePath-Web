import { normalizeContentTag } from '@/utils/normalizeContentTag';
import { z } from 'zod';
import { PollSelectionModeSchema } from './pollSelectionMode';
import { gentlePathPollStrings as copy } from '@/strings';

export const PollPagingSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().nonnegative().safe().default(0),
});
export const PollQuerySchema = PollPagingSchema.extend({
  query: z.string().trim().max(500).default(''),
  selectionMode: PollSelectionModeSchema.optional(),
  scope: z.enum(['all', 'mine']).default('all'),
  tag: z.string().trim().max(100).default('').transform(normalizeContentTag),
  createdAfter: z.iso.datetime({ offset: true }).optional(),
  createdBefore: z.iso.datetime({ offset: true }).optional(),
}).refine(
  (input) =>
    !input.createdAfter ||
    !input.createdBefore ||
    Date.parse(input.createdAfter) <= Date.parse(input.createdBefore),
  { message: copy.validation.dateDescription },
);
export type PollPaging = z.infer<typeof PollPagingSchema>;
export type PollQuery = z.infer<typeof PollQuerySchema>;

export function pollQueryParams(
  values: Record<string, string | number | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  return params;
}
