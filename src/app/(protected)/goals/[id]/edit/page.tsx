import type { Metadata } from 'next';
import { GoalEditorScreen } from '@/modules/goals/GoalEditorScreen';
import { gentlePathGoalStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.editGoal };
export default async function EditGoalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GoalEditorScreen id={id} />;
}
