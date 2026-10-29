import { z } from 'zod';
export const CommercialRelationshipSchema = z.enum([
  'PAID_SPONSORSHIP',
  'AFFILIATE',
]);
export type CommercialRelationship = z.infer<
  typeof CommercialRelationshipSchema
>;
