import {
  AppearancePreferenceSchema,
  defaultAppearancePreference,
  type AppearancePreference,
} from '@/models/appearance';
export class ThemePreferenceService {
  async getPreference(): Promise<AppearancePreference> {
    try {
      return AppearancePreferenceSchema.parse(
        JSON.parse(localStorage.getItem('semantic-web-theme') || '{}'),
      );
    } catch {
      return defaultAppearancePreference;
    }
  }
  async savePreference(value: AppearancePreference) {
    const preference = AppearancePreferenceSchema.parse(value);
    localStorage.setItem('semantic-web-theme', JSON.stringify(preference));
    return preference;
  }
}
