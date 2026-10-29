import { DiscountDetailScreen } from '@/modules/commercial/DiscountDetailScreen';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: copy.discountsTitle };
export default async function DiscountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DiscountDetailScreen id={id} />;
}
