import { z } from 'zod';

export const PlatformAvailabilityTransportSchema = z
  .object({
    community_enabled: z.boolean(),
    registrations_enabled: z.boolean(),
    maintenance_mode: z.boolean(),
  })
  .strict();
