import { z } from 'zod';

export const GoalUploadSchema = z.object({
  id: z.uuid(),
  url: z
    .string()
    .refine(
      (value) =>
        /^https:\/\//.test(value) ||
        /^\/api\/backend\/portal\/goals\/uploads\/[0-9a-f-]+\/bytes$/.test(
          value,
        ),
    ),
  fields: z.record(z.string(), z.string()),
  expires_at: z.string().datetime(),
});
export type GoalUpload = z.infer<typeof GoalUploadSchema>;
