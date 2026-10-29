import type { Metadata } from 'next';
import { gentlePathPollStrings as copy } from '@/strings';
import { PollDetailScreen } from '@/modules/polls/PollDetailScreen';

export const metadata: Metadata = { title: copy.detailTitle };
export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PollDetailScreen id={id} />;
}
