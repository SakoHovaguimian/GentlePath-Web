import type { Metadata } from 'next';
import { GoalsScreen } from '@/modules/goals/GoalsScreen';
import { gentlePathGoalStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.title };
export default function GoalsPage() {
  return <GoalsScreen />;
}
