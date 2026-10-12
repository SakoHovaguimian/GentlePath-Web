import { z } from 'zod';
import { ThemeModeSchema } from './themeMode';
import { AccentThemeSchema } from './accentTheme';
export const AppearancePreferenceSchema = z.object({
  mode: ThemeModeSchema,
  accent: AccentThemeSchema,
});
export type AppearancePreference = z.infer<typeof AppearancePreferenceSchema>;
export const defaultAppearancePreference: AppearancePreference = {
  mode: 'light',
  accent: 'aqua',
};
