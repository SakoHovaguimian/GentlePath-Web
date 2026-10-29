import { z } from 'zod';

export const EditorialResourceTypeSchema = z.enum([
  'COLLECTION',
  'ARTICLE',
  'GUIDE',
  'FAQ',
  'TOOLKIT',
  'ACTIVITY',
  'BOOK',
  'PODCAST',
  'RESEARCH_PAPER',
  'COURSE',
  'WEBINAR',
  'WORKSHEET',
  'CHECKLIST',
  'TEMPLATE',
  'SOCIAL_STORY',
  'VISUAL_SCHEDULE',
  'COMMUNICATION_BOARD',
  'APP',
  'WEBSITE',
  'ORGANIZATION',
  'SERVICE',
  'SUPPORT_GROUP',
  'EVENT',
  'OTHER',
]);
export type EditorialResourceType = z.infer<typeof EditorialResourceTypeSchema>;
