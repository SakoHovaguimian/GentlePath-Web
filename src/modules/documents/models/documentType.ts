import { z } from 'zod';
import { gentlePathDocumentStrings as copy } from '@/strings';

export const DocumentTypeSchema = z.enum(
  [
    'EVALUATION',
    'DIAGNOSIS_REPORT',
    'IEP',
    'IFSP',
    'SECTION_504_PLAN',
    'SCHOOL_REPORT',
    'REFERRAL',
    'BENEFIT_APPLICATION',
    'INSURANCE',
    'THERAPY_REPORT',
    'CARE_PLAN',
    'CONSENT',
    'OTHER',
  ],
  { error: copy.validation.categoryDescription },
);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
