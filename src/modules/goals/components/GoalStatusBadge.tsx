import { Badge } from '@/components/ui';
import type { UiIntent } from '@/components/ui/models/uiIntent';
import type { GoalStatus } from '../models/goalStatus';
import { goalStatusLabel } from '../services/goalStatusLabel';

const intents: Record<GoalStatus, UiIntent> = {
  ACTIVE: 'info',
  COMPLETED: 'success',
  ARCHIVED: 'neutral',
};

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  return <Badge intent={intents[status]}>{goalStatusLabel(status)}</Badge>;
}
