import type { Metadata } from 'next';
import { GoalEditorScreen } from '@/modules/goals/GoalEditorScreen';
import { gentlePathGoalStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.newGoal };
export default function NewGoalPage() {
  return <GoalEditorScreen />;
}
