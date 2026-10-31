import { z } from 'zod';
export const GoalDownloadSchema = z.object({
  url: z
    .string()
    .refine(
      (value) =>
        /^https:\/\//.test(value) ||
        /^\/api\/backend\/portal\/goals\/[0-9a-f-]+\/media\/[0-9a-f-]+\/bytes(?:\?download=(?:true|false))?$/.test(
          value,
        ),
    ),
});
