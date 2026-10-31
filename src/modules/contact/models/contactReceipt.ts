import { z } from 'zod';

export const ContactReceiptSchema = z.object({
  sent: z.literal(true),
  demo: z.boolean().optional(),
});
export type ContactReceipt = z.infer<typeof ContactReceiptSchema>;
