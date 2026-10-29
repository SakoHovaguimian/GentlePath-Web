import type { Metadata } from 'next';
import { AIUsageScreen } from '@/modules/account-tools/AIUsageScreen';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export const metadata: Metadata = { title: copy.aiUsage.title };
export default function AIUsagePage() {
  return <AIUsageScreen />;
}
