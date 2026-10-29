import { z } from 'zod';
export const CommercialEnablementSchema = z
  .object({ is_enabled: z.boolean() })
  .strict();
export type CommercialEnablement = z.infer<typeof CommercialEnablementSchema>;
