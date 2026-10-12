import { z } from 'zod';
export const AccentThemeSchema = z.enum([
  'aqua',
  'brand',
  'blue',
  'indigo',
  'mint',
  'salmon',
  'violet',
  'amber',
  'teal',
  'rose',
  'sky',
  'emerald',
  'seafoam',
  'coral',
  'sunset',
  'orchid',
]);

export type AccentTheme = z.infer<typeof AccentThemeSchema>;
