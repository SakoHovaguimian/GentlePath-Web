import type { FeatureRequestTransport } from '@/services/api/models';
import type { DemoUser } from './demoUser';
import type { ChatMessage } from '@/modules/chat/models/chatMessage';
export interface DemoState {
  users: DemoUser[];
  featureRequests: FeatureRequestTransport[];
  messages: ChatMessage[];
  credentials: Map<string, { salt: string; hash: string }>;
  refreshTokens: Map<string, string>;
}
