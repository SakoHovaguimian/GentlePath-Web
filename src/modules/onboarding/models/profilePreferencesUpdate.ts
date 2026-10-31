import { z } from 'zod';
import { USStateCodeSchema } from './usStateCode';
import { DiscoveryPreferencesInputSchema } from './discoveryPreferencesInput';

export const ProfilePreferencesUpdateSchema = z
  .object({
    state_code: USStateCodeSchema,
    discovery: DiscoveryPreferencesInputSchema,
  })
  .strict();
export type ProfilePreferencesUpdate = z.infer<
  typeof ProfilePreferencesUpdateSchema
>;
