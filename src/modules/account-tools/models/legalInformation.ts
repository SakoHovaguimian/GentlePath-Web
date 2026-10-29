import { z } from 'zod';

export const LegalContextSchema = z.enum([
  'terms_of_service',
  'privacy_policy',
]);
export const LegalItemSchema = z.object({
  title: z.string(),
  sections: z.array(z.string()),
});
export const LegalInformationSchema = z.object({
  illustrative: z.boolean(),
  items: z.array(LegalItemSchema),
});
export type LegalContext = z.infer<typeof LegalContextSchema>;
