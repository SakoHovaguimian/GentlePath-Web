import { z } from 'zod';

export const CommunityAttachmentKindSchema = z.enum(['IMAGE', 'VIDEO', 'LINK']);
export type CommunityAttachmentKind = z.infer<
  typeof CommunityAttachmentKindSchema
>;
