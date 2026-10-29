import { z } from 'zod';

export const FrequentlyAskedQuestionSectionSchema = z.object({
  title: z.string(),
  sections: z.array(z.object({ question: z.string(), answer: z.string() })),
});
export const FrequentlyAskedQuestionsSchema = z.object({
  illustrative: z.boolean(),
  sections: z.array(FrequentlyAskedQuestionSectionSchema),
});
