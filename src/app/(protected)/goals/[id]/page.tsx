import type { Metadata } from 'next';
import { GoalDetailScreen } from '@/modules/goals/GoalDetailScreen';
import { gentlePathGoalStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.viewGoal };
export default async function GoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GoalDetailScreen id={id} />;
}
