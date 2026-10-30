import { normalizeContentTags } from '@/utils/normalizeContentTag';
import 'server-only';
import {
  gentlePathMilestoneAdminStrings as copy,
  gentlePathPortalStrings as portalCopy,
  gentlePathDemoStrings as demoCopy,
} from '@/strings';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { getDemoState } from '@/services/demo/demoState';
import type { DemoMilestoneAdminState } from '../models/demoMilestoneAdminState';
const globalState = globalThis as typeof globalThis & {
  gentlePathMilestoneAdminState?: DemoMilestoneAdminState;
};
const stoppedResponseValue = 'stopped';
function createState(): DemoMilestoneAdminState {
  const now = new Date().toISOString();
  const portal = getDemoPortalState();
  const milestones = portal.milestones.map((item) => ({
    id: item.id,
    content_type: 'MILESTONE' as const,
    milestone: item.title,
    information: item.description,
    observation_guidance:
      demoCopy.milestoneSeeds.find((seed) => seed.title === item.title)
        ?.guidance ?? null,
    tags: [
      ...(demoCopy.milestoneSeeds.find((seed) => seed.title === item.title)
        ?.tags ?? [item.category]),
    ],
    created_at: now,
    updated_at: now,
    response_options: Object.entries(portalCopy.milestones.responses).map(
      ([value, label], index) => ({
        id: `${item.id}-response-${value}`,
        milestone_id: item.id,
        value,
        label,
        position: index,
        deleted: false,
        created_at: now,
        updated_at: now,
      }),
    ),
  }));
  const user = getDemoState().users.find(
    (item) => item.role === 'user' && !item.deleted,
  );
  const staff = getDemoState().users.find(
    (item) => item.role === 'admin' && !item.deleted,
  );
  return {
    milestones,
    hiddenMilestoneIds: new Set(),
    referencedOptionIds: new Set(
      milestones.flatMap((milestone) =>
        milestone.response_options
          .filter((option) =>
            portal.observations.some(
              (observation) =>
                observation.milestoneId === milestone.id &&
                observation.response === option.value,
            ),
          )
          .map((option) => option.id),
      ),
    ),
    observations: portal.observations.flatMap((observation) => {
      const option = milestones
        .find((milestone) => milestone.id === observation.milestoneId)
        ?.response_options.find(
          (option) => option.value === observation.response,
        );
      return option
        ? [
            {
              id: crypto.randomUUID(),
              child_id: observation.childId,
              milestone_id: observation.milestoneId,
              response_option_id: option.id,
              recorded_by_user_id: observation.userId,
              observed_at: observation.observedAt,
              notes: null,
              deleted: false,
              created_at: observation.observedAt,
              updated_at: observation.observedAt,
            },
          ]
        : [];
    }),
    tips:
      !user || !milestones[0]
        ? []
        : [
            {
              message: copy.demo.approvedMessage,
              approval_status: 'APPROVED' as const,
            },
            {
              message: copy.demo.pendingMessage,
              approval_status: 'PENDING' as const,
            },
            {
              message: copy.demo.rejectedMessage,
              approval_status: 'REJECTED' as const,
            },
          ].map((seed, index) => ({
            id: crypto.randomUUID(),
            content_type: 'TIP' as const,
            milestone_id: milestones[index % milestones.length].id,
            user_id: user.id,
            message: seed.message,
            approval_status: seed.approval_status,
            author: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
            },
            created_at: new Date(
              Date.now() - (index + 1) * 86400000,
            ).toISOString(),
            updated_at: now,
            deleted: false,
            review: {
              reviewed_by_user_id:
                seed.approval_status === 'PENDING' ? null : (staff?.id ?? null),
              reviewed_at: seed.approval_status === 'PENDING' ? null : now,
              review_notes:
                seed.approval_status === 'REJECTED'
                  ? copy.demo.rejectionNote
                  : null,
            },
          })),
  };
}
export function getDemoMilestoneAdminState() {
  const state = (globalState.gentlePathMilestoneAdminState ??= createState());
  const now = new Date().toISOString();
  demoCopy.milestoneSeeds.forEach((seed, index) => {
    const id = `milestone-${index + 1}`;
    if (
      state.milestones.some((item) => item.id === id) ||
      state.hiddenMilestoneIds.has(id)
    )
      return;
    state.milestones.push({
      id,
      content_type: 'MILESTONE',
      milestone: seed.title,
      information: seed.description,
      observation_guidance: seed.guidance,
      tags: [...seed.tags],
      created_at: now,
      updated_at: now,
      response_options: Object.entries(portalCopy.milestones.responses).map(
        ([value, label], position) => ({
          id: `${id}-response-${value}`,
          milestone_id: id,
          value,
          label,
          position,
          deleted: false,
          created_at: now,
          updated_at: now,
        }),
      ),
    });
  });
  for (const record of state.milestones) {
    record.tags = normalizeContentTags(record.tags);
    const options = record.response_options ?? [];
    if (
      ['not_yet', 'emerging', 'often'].every((value) =>
        options.some((option) => option.value === value && !option.deleted),
      ) &&
      !options.some((option) => option.value === 'stopped')
    )
      options.push({
        id: `${record.id}-response-stopped`,
        milestone_id: record.id,
        value: stoppedResponseValue,
        label: portalCopy.milestones.responses.stopped,
        position: Math.max(-1, ...options.map((option) => option.position)) + 1,
        deleted: false,
        created_at: now,
        updated_at: now,
      });
  }
  // A running demo may have initialized guidance before the observation module
  // was hot-reloaded. Upgrade only the missing collection and retain all edits.
  state.observations ??= getDemoPortalState().observations.flatMap(
    (observation) => {
      const option = state.milestones
        .find((milestone) => milestone.id === observation.milestoneId)
        ?.response_options?.find(
          (option) => option.value === observation.response,
        );
      return option
        ? [
            {
              id: crypto.randomUUID(),
              child_id: observation.childId,
              milestone_id: observation.milestoneId,
              response_option_id: option.id,
              recorded_by_user_id: observation.userId,
              observed_at: observation.observedAt,
              notes: null,
              deleted: false,
              created_at: observation.observedAt,
              updated_at: observation.observedAt,
            },
          ]
        : [];
    },
  );
  return state;
}
export function resetDemoMilestoneAdminState() {
  delete globalState.gentlePathMilestoneAdminState;
}
export function getDemoMilestoneObservationDates(userId: string): string[] {
  const state = getDemoMilestoneAdminState();
  const account = getDemoState().users.find(
    (user) => user.id === userId && !user.deleted && !user.disabled,
  );
  if (!account) return [];
  const children = getDemoPortalState().children.filter(
    (child) => child.userId === userId,
  );
  return state.observations
    .filter(
      (observation) =>
        !observation.deleted &&
        children.some((child) => child.id === observation.child_id) &&
        !state.hiddenMilestoneIds.has(observation.milestone_id) &&
        state.milestones.some(
          (milestone) => milestone.id === observation.milestone_id,
        ),
    )
    .map((observation) => observation.observed_at);
}
export function getDemoMilestoneObservationCount(userId: string): number {
  return getDemoMilestoneObservationDates(userId).length;
}
