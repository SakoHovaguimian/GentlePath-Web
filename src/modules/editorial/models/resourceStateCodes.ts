import { z } from 'zod';
import { USStateCodeSchema } from '@/modules/onboarding/models/usStateCode';
import { gentlePathEditorialDiscoveryStrings as copy } from '@/strings';

export const ResourceStateCodesSchema = z
  .array(USStateCodeSchema)
  .max(51, copy.invalidStatesDescription)
  .refine(
    (codes) => new Set(codes).size === codes.length,
    copy.invalidStatesDescription,
  );
