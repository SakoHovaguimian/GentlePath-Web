import { z } from 'zod';
import { strings } from '@/strings';
import { isPublicImageReference } from '@/models/publicImageUrl';
export const publicImageMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;
export const publicImageMaxBytes = 5 * 1024 * 1024;
export const PublicImageSchema = z.object({
  fileName: z.string().min(1),
  thumbnailFileName: z.string().nullable().optional(),
  visibility: z.literal('public'),
  url: z
    .string()
    .max(2000)
    .refine(isPublicImageReference, strings.media.imageUrlError),
  thumbnailUrl: z
    .string()
    .refine(isPublicImageReference, strings.media.imageUrlError)
    .nullable()
    .optional(),
});
export type PublicImage = z.infer<typeof PublicImageSchema>;
