import type { Metadata } from 'next';
import { gentlePathPollStrings as copy } from '@/strings';
import { PollsScreen } from '@/modules/polls/PollsScreen';

export const metadata: Metadata = { title: copy.title };
export default function PollsPage() {
  return <PollsScreen />;
}
