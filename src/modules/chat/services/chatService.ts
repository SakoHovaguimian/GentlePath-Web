import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import {
  ChatMessageInputSchema,
  type ChatMessage,
} from '../models/chatMessage';
import {
  ChatMessageTransportSchema,
  ChatMessagePageTransportSchema,
  type ChatMessageTransport,
} from '../models/chatMessageTransport';
import {
  ChatMessageQuerySchema,
  type ChatMessageQuery,
} from '../models/chatMessageQuery';
import type { ChatMessagePage } from '../models/chatMessagePage';

function mapChatMessage(message: ChatMessageTransport): ChatMessage {
  return {
    id: message.id,
    userId: message.user_id,
    author: `${message.author.first_name} ${message.author.last_name}`.trim(),
    message: message.message,
    createdAt: message.created_at,
    updatedAt: message.updated_at,
  };
}

export class ChatService {
  constructor(private readonly api: ApiClientInterface) {}
  async listMessages(
    query: ChatMessageQuery = { limit: 25, offset: 0 },
    signal?: AbortSignal,
  ): Promise<ChatMessagePage> {
    const paging = ChatMessageQuerySchema.parse(query);
    const params = new URLSearchParams({
      limit: String(paging.limit),
      offset: String(paging.offset),
    });
    const result = ChatMessagePageTransportSchema.parse(
      await this.api.request(`/chat-messages?${params}`, { signal }),
    );
    return { ...result, data: result.data.map(mapChatMessage) };
  }
  async sendMessage(message: string) {
    return mapChatMessage(
      ChatMessageTransportSchema.parse(
        await this.api.request('/chat-messages', {
          method: 'POST',
          body: ChatMessageInputSchema.parse({ message }),
        }),
      ),
    );
  }
  async updateMessage(id: string, message: string) {
    return mapChatMessage(
      ChatMessageTransportSchema.parse(
        await this.api.request(`/chat-messages/${encodeURIComponent(id)}`, {
          method: 'PUT',
          body: ChatMessageInputSchema.parse({ message }),
        }),
      ),
    );
  }
  deleteMessage(id: string) {
    return this.api.request<void>(`/chat-messages/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}
