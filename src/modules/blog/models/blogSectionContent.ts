import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogContentTextFormatSchema } from './blogContentTextFormat';

export const BlogSectionContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: z.literal('section'),
    metaData: z
      .object({
        title: z.string().trim().max(200, copy.invalidHeading).default(''),
        body: z
          .string()
          .trim()
          .min(1, copy.invalidText)
          .max(50000, copy.invalidLegacyText),
        format: BlogContentTextFormatSchema.default('plain'),
      })
      .strict()
      .superRefine((metadata, context) => {
        if (metadata.format === 'plain' && metadata.body.length > 20000)
          context.addIssue({
            code: 'custom',
            message: copy.invalidText,
            path: ['body'],
          });
      }),
  })
  .strict();
export type BlogSectionContent = z.infer<typeof BlogSectionContentSchema>;

export const BlogReadableSectionContentSchema = BlogSectionContentSchema.extend(
  {
    metaData: z
      .object({
        title: z.string().optional(),
        body: z.string(),
        format: BlogContentTextFormatSchema.optional(),
      })
      .passthrough(),
  },
).passthrough();
