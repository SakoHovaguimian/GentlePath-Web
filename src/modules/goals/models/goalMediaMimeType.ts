import { z } from 'zod';

export const GoalMediaMimeTypeSchema = z.enum([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/quicktime',
]);

export type GoalMediaMimeType = z.infer<typeof GoalMediaMimeTypeSchema>;
