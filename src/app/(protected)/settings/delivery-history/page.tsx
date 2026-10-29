import type { Metadata } from 'next';
import { DeliveryHistoryScreen } from '@/modules/account-tools/DeliveryHistoryScreen';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export const metadata: Metadata = { title: copy.deliveries.title };
export default function DeliveryHistoryPage() {
  return <DeliveryHistoryScreen />;
}
