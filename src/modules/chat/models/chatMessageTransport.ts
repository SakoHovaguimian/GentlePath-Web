import { z } from 'zod';
import { ChatMessagePageMetadataSchema } from './chatMessagePageMetadata';

export const ChatMessageTransportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  message: z.string().min(1).max(2000),
  author: z.object({
    id: z.string().uuid(),
    first_name: z.string(),
    last_name: z.string(),
  }),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export const ChatMessagePageTransportSchema = z.object({
  data: z.array(ChatMessageTransportSchema),
  page: ChatMessagePageMetadataSchema,
});
export type ChatMessageTransport = z.infer<typeof ChatMessageTransportSchema>;
