import { z } from 'zod';

export const ServiceApplicationStatusSchema = z.enum([
  'DRAFT',
  'APPLIED',
  'WAITLISTED',
  'APPROVED',
  'DENIED',
  'WITHDRAWN',
]);

export type ServiceApplicationStatus = z.infer<
  typeof ServiceApplicationStatusSchema
>;
