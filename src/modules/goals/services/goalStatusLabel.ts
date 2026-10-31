import { gentlePathGoalStrings as copy } from '@/strings';
import type { GoalStatus } from '../models/goalStatus';
export function goalStatusLabel(status: GoalStatus): string {
  return status === 'ACTIVE'
    ? copy.active
    : status === 'COMPLETED'
      ? copy.completed
      : copy.archived;
}
