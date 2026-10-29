import type { Metadata } from 'next';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityPostScreen } from '@/modules/community/CommunityPostScreen';

export const metadata: Metadata = { title: copy.postTitle };
export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommunityPostScreen id={id} />;
}
