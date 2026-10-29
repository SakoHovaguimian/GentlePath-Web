import { z } from 'zod';

export const PlatformSettingsSchema = z.object({
  communityEnabled: z.boolean(),
  registrationsEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
  resourceReviewRequired: z.boolean(),
});
export type PlatformSettings = z.infer<typeof PlatformSettingsSchema>;
