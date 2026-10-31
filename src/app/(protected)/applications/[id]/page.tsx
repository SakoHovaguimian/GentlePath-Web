import type { Metadata } from 'next';
import { ApplicationDetailScreen } from '@/modules/applications/ApplicationDetailScreen';
import { gentlePathApplicationStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.title };
export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicationDetailScreen id={id} />;
}
