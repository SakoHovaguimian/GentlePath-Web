import { z } from 'zod';
export const MotionPreferenceSchema = z.enum(['system', 'reduced']);
export type MotionPreference = z.infer<typeof MotionPreferenceSchema>;
export const defaultMotionPreference: MotionPreference = 'system';
