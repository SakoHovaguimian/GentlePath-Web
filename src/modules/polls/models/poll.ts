import { CommunityAttachmentsSchema } from '@/modules/community/models/communityAttachment';
import { normalizeContentTag } from '@/utils/normalizeContentTag';
import { z } from 'zod';
import { gentlePathPollStrings as copy } from '@/strings';
import { PollAuthorSchema } from './pollAuthor';
import { PollOptionInputSchema, PollOptionSchema } from './pollOption';
import { PollSelectionModeSchema } from './pollSelectionMode';

export const PollInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, copy.validation.titleDescription)
      .max(500, copy.validation.titleDescription),
    message: z
      .string()
      .trim()
      .min(1, copy.validation.messageDescription)
      .max(20000, copy.validation.messageDescription),
    attachments: CommunityAttachmentsSchema.optional(),
    selectionMode: PollSelectionModeSchema,
    tags: z
      .array(
        z
          .string()
          .trim()
          .min(1, copy.validation.tagsDescription)
          .max(100, copy.validation.tagsDescription)
          .transform(normalizeContentTag)
          .refine((tag) => tag.length <= 100, copy.validation.tagsDescription),
      )
      .max(30, copy.validation.tagsDescription)
      .refine(
        (tags) =>
          new Set(tags.map((tag) => tag.toLocaleLowerCase('en-US'))).size ===
          tags.length,
        copy.validation.tagsDescription,
      ),
    options: z
      .array(PollOptionInputSchema)
      .min(2, copy.validation.optionsDescription)
      .max(100, copy.validation.optionsDescription)
      .refine((options) => {
        const ids = options.flatMap((option) => (option.id ? [option.id] : []));
        return new Set(ids).size === ids.length;
      }, copy.validation.optionsDescription),
  })
  .strict();
export const PollSchema = z.object({
  attachments: CommunityAttachmentsSchema.default([]),
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  title: z.string(),
  message: z.string(),
  selectionMode: PollSelectionModeSchema,
  tags: z.array(z.string().transform(normalizeContentTag)),
  author: PollAuthorSchema.nullable(),
  options: z.array(PollOptionSchema),
  expiresAt: z.string().datetime({ offset: true }).nullable().default(null),
  isExpired: z.boolean().default(false),
  votingLocked: z.boolean().default(false),
  participantsCount: z.number().int().nonnegative(),
  commentsCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PollInput = z.infer<typeof PollInputSchema>;
export type Poll = z.infer<typeof PollSchema>;
