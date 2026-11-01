import 'server-only';
import { ValidationError } from '@/errors/domainErrors';
import { getDemoMilestoneAdminState } from './demoMilestoneAdminState';

export function validateDemoMilestoneLinks(ids: string[] | undefined) {
  const state = getDemoMilestoneAdminState();
  if (
    ids?.some(
      (id) =>
        !state.milestones.some((milestone) => milestone.id === id) ||
        state.hiddenMilestoneIds.has(id),
    )
  )
    throw new ValidationError();
}
export function visibleDemoMilestoneIds(ids: string[] = []): string[] {
  const state = getDemoMilestoneAdminState();
  return ids
    .filter(
      (id) =>
        state.milestones.some((milestone) => milestone.id === id) &&
        !state.hiddenMilestoneIds.has(id),
    )
    .sort();
}
