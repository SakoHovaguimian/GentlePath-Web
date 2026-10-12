import type { Metadata } from 'next';
import { strings } from '@/strings';
export const metadata: Metadata = {
  title: strings.ui.featureRequestDetailScreen.featureRequestDetail,
};
import { FeatureRequestDetailScreen } from '@/modules/feature-requests/FeatureRequestDetailScreen';

export default async function FeatureRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <FeatureRequestDetailScreen featureRequestId={id} />;
}
