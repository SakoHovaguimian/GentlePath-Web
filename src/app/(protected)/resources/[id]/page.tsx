import type { Metadata } from 'next';
import { gentlePathPortalStrings as copy } from '@/strings';
import { ResourceDetailScreen } from '@/modules/portal/ResourceDetailScreen';
export const metadata: Metadata = { title: copy.navigation.resources };
export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResourceDetailScreen id={id} />;
}
