import { z } from 'zod';

export const ContactContextSchema = z.enum([
  'INITIAL_CONTACT',
  'FEATURE_REQUEST',
  'BUG_REPORT',
  'FEEDBACK',
]);
export type ContactContext = z.infer<typeof ContactContextSchema>;
