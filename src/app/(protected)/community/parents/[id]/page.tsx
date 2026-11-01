import type { Metadata } from 'next';
import { gentlePathCommunityDiscoveryStrings as copy } from '@/strings';
import { CommunityProfileScreen } from '@/modules/community/CommunityProfileScreen';

export const metadata: Metadata = { title: copy.profileTitle };
export default async function CommunityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CommunityProfileScreen id={id} />;
}
