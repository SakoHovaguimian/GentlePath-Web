import { z } from 'zod';

export const DemoAccountPresetSchema = z.enum([
  'newUser',
  'onboarding',
  'user',
  'admin',
  'superadmin',
]);

export type DemoAccountPreset = z.infer<typeof DemoAccountPresetSchema>;
