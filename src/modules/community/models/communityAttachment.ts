import { z } from 'zod';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { isPublicHttpsUrl } from '@/modules/blog/models/blogContentUrl';
import { CommunityPublicUrlSchema } from './communityPublicUrl';
import { CommunityAttachmentKindSchema } from './communityAttachmentKind';

export const CommunityAttachmentSchema = z
  .object({
    kind: CommunityAttachmentKindSchema,
    url: CommunityPublicUrlSchema.refine(
      isPublicHttpsUrl,
      copy.validation.imageUrl,
    ),
    description: z
      .string()
      .trim()
      .min(1, copy.validation.attachmentDescription)
      .max(500, copy.validation.attachmentDescription),
  })
  .strict();
export const CommunityAttachmentsSchema = z
  .array(CommunityAttachmentSchema)
  .max(10, copy.validation.attachments);
export type CommunityAttachment = z.infer<typeof CommunityAttachmentSchema>;
