import { z } from 'zod';
import { DemoContextSchema } from './demoContext';
import { UserRoleSchema } from './userRole';

export const DemoSettingsSchema = DemoContextSchema.extend({
  demoMode: z.boolean(),
  enabled: z.boolean(),
  role: UserRoleSchema,
});
export const DemoSettingsInputSchema = DemoContextSchema.extend({
  demoMode: z.boolean(),
}).strict();
export type DemoSettings = z.infer<typeof DemoSettingsSchema>;
export type DemoSettingsInput = z.infer<typeof DemoSettingsInputSchema>;
