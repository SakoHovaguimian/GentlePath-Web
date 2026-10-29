import { z } from 'zod';

export const EditorialResourceFormatSchema = z.enum([
  'WEB_PAGE',
  'PDF',
  'DOCUMENT',
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'INTERACTIVE',
  'EXTERNAL_APP',
  'OTHER',
]);
export type EditorialResourceFormat = z.infer<
  typeof EditorialResourceFormatSchema
>;
