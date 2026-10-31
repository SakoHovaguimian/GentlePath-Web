import type { Metadata } from 'next';
import { gentlePathStateBenefitsStrings as copy } from '@/strings';
import { StateBenefitDetailScreen } from '@/modules/state-benefits/StateBenefitDetailScreen';

export const metadata: Metadata = { title: copy.title };
export default async function StateBenefitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StateBenefitDetailScreen id={id} />;
}
