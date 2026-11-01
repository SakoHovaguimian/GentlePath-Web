import { z } from 'zod';
import { gentlePathLinkedContentStrings as copy } from '@/strings';

export const MilestoneLinksSchema = z
  .array(z.string().min(1))
  .max(10, copy.limit)
  .refine((ids) => new Set(ids).size === ids.length, copy.distinct);
