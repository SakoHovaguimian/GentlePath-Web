import { z } from 'zod';
import { gentlePathPortalStrings as copy } from '@/strings';

const supportAnswer = z.string().trim().max(2000, copy.family.answerLimit);

export const ChildSupportDetailsSchema = z
  .object({
    allergies: supportAnswer.default(''),
    communication: supportAnswer.default(''),
    sensoryNeeds: supportAnswer.default(''),
    comfortStrategies: supportAnswer.default(''),
    dailyRoutines: supportAnswer.default(''),
  })
  .strict();

export type ChildSupportDetails = z.infer<typeof ChildSupportDetailsSchema>;
