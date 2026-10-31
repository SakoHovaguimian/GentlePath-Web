import { ChildProfileSchema } from '@/modules/portal/models/childProfile';
import { z } from 'zod';
import { gentlePathGoalStrings as copy } from '@/strings';
import { GoalMediaMimeTypeSchema } from './goalMediaMimeType';

export const GoalUploadInputSchema = z
  .object({
    child_id: ChildProfileSchema.shape.id.min(1),
    original_file_name: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[^\u0000-\u001f\u007f/\\]+$/),
    mime_type: GoalMediaMimeTypeSchema,
    size_bytes: z
      .number()
      .int()
      .positive()
      .max(100 * 1024 * 1024),
  })
  .strict()
  .refine(
    (input) =>
      input.mime_type.startsWith('video/') ||
      input.size_bytes <= 10 * 1024 * 1024,
    { message: copy.invalidFile, path: ['size_bytes'] },
  );
export type GoalUploadInput = z.infer<typeof GoalUploadInputSchema>;
