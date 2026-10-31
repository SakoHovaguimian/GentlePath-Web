import { isPublicImageReference } from '@/models/publicImageUrl';
import { z } from 'zod';
import { gentlePathEditorialStrings as copy } from '@/strings';

export const ContentUrlSchema = z
  .string()
  .max(1000, copy.validation.urlDescription)
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        /^https?:$/.test(url.protocol) &&
        !url.username &&
        !url.password &&
        !/[\u0000-\u0020\u007f\\]/.test(value)
      );
    } catch {
      return false;
    }
  }, copy.validation.urlDescription);

export const PublicImageUrlSchema = z
  .string()
  .trim()
  .max(1000, copy.validation.imageDescription)
  .refine(isPublicImageReference, copy.validation.imageDescription);
