import type { Metadata } from 'next';
import { gentlePathStateBenefitsStrings as copy } from '@/strings';
import { StateBenefitsScreen } from '@/modules/state-benefits/StateBenefitsScreen';

export const metadata: Metadata = { title: copy.title };
export default function StateBenefitsPage() {
  return <StateBenefitsScreen />;
}
