import type { Metadata } from 'next';
import { ChatScreen } from '@/modules/chat/ChatScreen';
import { strings } from '@/strings';
export const metadata: Metadata = { title: strings.chat.title };
export default function ChatPage() {
  return <ChatScreen />;
}
