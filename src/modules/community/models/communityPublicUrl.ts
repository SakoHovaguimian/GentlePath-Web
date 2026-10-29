import { z } from 'zod';
import { gentlePathCommunityStrings as copy } from '@/strings';

export const CommunityPublicUrlSchema = z
  .string()
  .trim()
  .max(1000, copy.validation.imageUrl)
  .refine((value) => {
    try {
      const url = new URL(value);
      const path = decodeURIComponent(url.pathname);
      return (
        !/[\u0000-\u0020\u007f\\]/.test(value) &&
        url.protocol === 'https:' &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash &&
        !path.includes('%') &&
        !/(^|\/)(care-documents|care_documents|private)(\/|$)/i.test(path)
      );
    } catch {
      return false;
    }
  }, copy.validation.imageUrl);
