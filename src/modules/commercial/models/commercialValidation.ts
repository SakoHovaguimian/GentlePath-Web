import { z } from 'zod';
import { gentlePathCommercialStrings as copy } from '@/strings';
export const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1, copy.validation.required)
    .max(max, copy.validation.invalid);
export const dateTime = z
  .string()
  .datetime({ offset: true, message: copy.validation.date });
export const contentUrl = text(1000).refine((value) => {
  if (!/^https?:\/\//i.test(value) || /[\u0000-\u0020\u007f\\]/.test(value))
    return false;
  try {
    const url = new URL(value);
    return !url.username && !url.password;
  } catch {
    return false;
  }
}, copy.validation.url);
export const publicContentUrl = contentUrl.refine((value) => {
  try {
    const url = new URL(value);
    const path = decodeURIComponent(url.pathname);
    return (
      url.protocol === 'https:' &&
      !url.search &&
      !url.hash &&
      !path.includes('%') &&
      !/(^|\/)(care-documents|care_documents|private)(\/|$)/i.test(path)
    );
  } catch {
    return false;
  }
}, copy.validation.publicUrl);
export const lifecycleShape = {
  id: z.string().uuid(),
  deleted: z.boolean(),
  created_at: dateTime,
  updated_at: dateTime,
};
export const reviewShape = {
  review_status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  is_enabled: z.boolean(),
  reviewed_by_user_id: z.string().uuid().nullable(),
  reviewed_at: dateTime.nullable(),
  review_notes: z.string().nullable(),
};
