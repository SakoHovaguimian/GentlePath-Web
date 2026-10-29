import { z } from 'zod';
import { gentlePathPortalStrings as copy } from '@/strings';

export const ReportResolutionSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
  resolutionNote: z
    .string()
    .trim()
    .min(3, copy.validation.resolution)
    .max(2000),
});
export const ModerationReportSchema = z.object({
  id: z.string(),
  contentTitle: z.string(),
  reason: z.string(),
  reporterName: z.string(),
  status: z.enum(['open', 'resolved', 'dismissed']),
  createdAt: z.string().datetime(),
  resolutionNote: z.string(),
  reviewerId: z.string().nullable().default(null),
  reviewedAt: z.string().datetime().nullable().default(null),
});
export type ModerationReport = z.infer<typeof ModerationReportSchema>;
export type ReportResolution = z.infer<typeof ReportResolutionSchema>;
