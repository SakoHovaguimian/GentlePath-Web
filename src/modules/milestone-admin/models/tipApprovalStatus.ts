import { z } from 'zod';
export const TipApprovalStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
]);
export type TipApprovalStatus = z.infer<typeof TipApprovalStatusSchema>;
