import {
  MotionPreferenceSchema,
  defaultMotionPreference,
  type MotionPreference,
} from '@/models/motionPreference';

export class MotionPreferenceService {
  async getPreference(): Promise<MotionPreference> {
    try {
      return MotionPreferenceSchema.parse(
        JSON.parse(localStorage.getItem('portal-motion') || 'null'),
      );
    } catch {
      return defaultMotionPreference;
    }
  }

  async savePreference(value: MotionPreference) {
    const preference = MotionPreferenceSchema.parse(value);
    localStorage.setItem('portal-motion', JSON.stringify(preference));
    return preference;
  }
}
