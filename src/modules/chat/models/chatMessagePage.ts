import { z } from 'zod';
import { ChatMessageSchema } from './chatMessage';
import { ChatMessagePageMetadataSchema } from './chatMessagePageMetadata';

export const ChatMessagePageSchema = z.object({
  data: z.array(ChatMessageSchema),
  page: ChatMessagePageMetadataSchema,
});
export type ChatMessagePage = z.infer<typeof ChatMessagePageSchema>;
