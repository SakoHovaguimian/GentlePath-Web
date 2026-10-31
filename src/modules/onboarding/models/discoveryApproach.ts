import { z } from 'zod';

export const DiscoveryApproachSchema = z.enum([
  'CONVENTIONAL',
  'HOLISTIC',
  'FUNCTIONAL',
  'INTEGRATIVE',
  'EMERGING',
]);
export type DiscoveryApproach = z.infer<typeof DiscoveryApproachSchema>;
