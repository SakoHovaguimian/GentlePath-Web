import 'server-only';
import { z } from 'zod';
import {
  ApiError,
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { canManageContent } from '@/services/auth/permissions';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import {
  MilestoneGuidanceInputSchema,
  type MilestoneGuidance,
  type MilestoneGuidanceInput,
} from '../models/milestoneGuidance';
import {
  FamilyTipInputSchema,
  FamilyTipUpdateSchema,
  type FamilyTip,
} from '../models/familyTip';
import { TipReviewInputSchema } from '../models/tipReview';
import { MilestoneAdminQuerySchema } from '../models/milestoneAdminQuery';
import { getDemoMilestoneAdminState } from './demoMilestoneAdminState';
import { handleDemoMilestoneObservations } from './handleDemoMilestoneObservations';
export { resetDemoMilestoneAdminState } from './demoMilestoneAdminState';
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const body = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });
const noContent = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });

export async function handleMilestoneAdminRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, resource, id, action, subaction, extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area === 'portal' && resource === 'milestone-observations')
    return handleDemoMilestoneObservations(request, path, session, context);
  if (
    !['portal', 'admin'].includes(area) ||
    !['milestone-tools', 'tips'].includes(resource)
  )
    return null;
  if (extra) throw new NotFoundError();
  const accounts = getDemoState();
  const actor = accounts.users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.disabled &&
      !user.deleted,
  );
  if (!session.demo || !actor) throw new AuthError();
  const staff = canManageContent(actor.role ?? 'user');
  if (area === 'admin' && !staff) throw new OwnershipError();
  const state = getDemoMilestoneAdminState();
  const portal = getDemoPortalState();
  const method = request.method;
  const milestoneVisible = (milestoneId: string) =>
    state.milestones.some(
      (item) =>
        item.id === milestoneId && !state.hiddenMilestoneIds.has(item.id),
    );
  const userAvailable = (userId: string | null) =>
    accounts.users.some((user) => user.id === userId && !user.deleted);
  for (const milestone of state.milestones)
    for (const option of milestone.response_options ?? [])
      if (
        portal.observations.some(
          (observation) =>
            observation.milestoneId === milestone.id &&
            observation.response === option.value,
        )
      )
        state.referencedOptionIds.add(option.id);
  const detailed = (item: MilestoneGuidance): MilestoneGuidance => ({
    ...item,
    response_options: item.response_options?.filter(
      (option) => !option.deleted,
    ),
    approved_tip_count: state.tips.filter(
      (tip) =>
        !tip.deleted &&
        tip.milestone_id === item.id &&
        tip.approval_status === 'APPROVED' &&
        userAvailable(tip.user_id),
    ).length,
  });
  const syncPortal = (item: MilestoneGuidance) => {
    const old = portal.milestones.find((milestone) => milestone.id === item.id);
    const value = {
      id: item.id,
      title: item.milestone,
      description: item.information,
      category: item.tags[0] ?? '',
      response: old?.response ?? null,
      observedAt: old?.observedAt ?? null,
    };
    if (old) Object.assign(old, value);
    else portal.milestones.push(value);
  };
  const query = () => {
    const parsed = MilestoneAdminQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!parsed.success)
      throw new ValidationError(copy.validation.invalidQuery);
    const params = url.searchParams;
    for (const [after, before] of [
      ['created_after', 'created_before'],
      ['reviewed_after', 'reviewed_before'],
    ]) {
      const start = params.get(after),
        end = params.get(before);
      if (
        (start &&
          !z.string().datetime({ offset: true }).safeParse(start).success) ||
        (end &&
          !z.string().datetime({ offset: true }).safeParse(end).success) ||
        (start && end && Date.parse(start) > Date.parse(end))
      )
        throw new ValidationError(copy.validation.invalidQuery);
    }
    return parsed.data;
  };
  const dateMatches = (
    value: string | null | undefined,
    prefix: 'created' | 'reviewed',
  ) => {
    const after = url.searchParams.get(`${prefix}_after`),
      before = url.searchParams.get(`${prefix}_before`);
    return (
      (!after || Boolean(value && Date.parse(value) >= Date.parse(after))) &&
      (!before || Boolean(value && Date.parse(value) <= Date.parse(before)))
    );
  };
  const page = <T extends { id: string; created_at: string }>(items: T[]) => {
    const input = query();
    const sorted = [...items].sort(
      (a, b) =>
        b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id),
    );
    const scoped = context.scenario === 'empty' ? [] : sorted;
    const data = scoped.slice(input.offset, input.offset + input.limit);
    const hasMore = input.offset + data.length < scoped.length;
    return json({
      data,
      page: {
        limit: input.limit,
        offset: input.offset,
        hasMore,
        nextOffset: hasMore ? input.offset + input.limit : null,
      },
    });
  };
  function replaceOptions(
    item: MilestoneGuidance,
    input: MilestoneGuidanceInput['response_options'],
  ) {
    const previous = item.response_options ?? [];
    const ids = input.flatMap((option) => (option.id ? [option.id] : []));
    if (
      new Set(ids).size !== ids.length ||
      new Set(input.map((option) => option.value)).size !== input.length
    )
      throw new ValidationError(copy.validation.options);
    for (const option of input) {
      const existing = previous.find((old) => old.id === option.id);
      if (option.id && (!existing || existing.deleted))
        throw new ValidationError(copy.validation.invalidOption);
      if (existing && existing.value !== option.value)
        throw new ApiError(copy.validation.immutableValue, 409);
      if (
        existing &&
        existing.label !== option.label &&
        state.referencedOptionIds.has(existing.id)
      )
        throw new ApiError(copy.validation.immutableLabel, 409);
      if (!existing && previous.some((old) => old.value === option.value))
        throw new ApiError(copy.validation.retiredValue, 409);
    }
    const now = new Date().toISOString();
    const active = input.map((option, position) => ({
      ...option,
      id: option.id ?? crypto.randomUUID(),
      milestone_id: item.id,
      position,
      deleted: false,
      created_at:
        previous.find((old) => old.id === option.id)?.created_at ?? now,
      updated_at: now,
    }));
    item.response_options = [
      ...active,
      ...previous
        .filter((old) => !ids.includes(old.id))
        .map((old, index) => ({
          ...old,
          deleted: true,
          position: active.length + index,
          updated_at: now,
        })),
    ];
    item.updated_at = now;
  }
  if (resource === 'milestone-tools') {
    if (area === 'portal' && method === 'GET' && !action) {
      if (id) {
        const item = state.milestones.find(
          (item) => item.id === id && milestoneVisible(item.id),
        );
        if (!item) throw new NotFoundError();
        return json(detailed(item));
      }
      const filter = query();
      return page(
        state.milestones
          .filter(
            (item) =>
              milestoneVisible(item.id) &&
              (!filter.query ||
                `${item.milestone} ${item.information}`
                  .toLowerCase()
                  .includes(filter.query.toLowerCase())) &&
              (!filter.tag || item.tags.includes(filter.tag)) &&
              dateMatches(item.created_at, 'created'),
          )
          .map(detailed),
      );
    }
    if (area !== 'admin') throw new NotFoundError();
    if (method === 'POST' && !id) {
      const input = MilestoneGuidanceInputSchema.parse(await body(request));
      const now = new Date().toISOString();
      const item: MilestoneGuidance = {
        ...input,
        id: crypto.randomUUID(),
        content_type: 'MILESTONE',
        created_at: now,
        updated_at: now,
        response_options: [],
      };
      replaceOptions(item, input.response_options);
      state.milestones.push(item);
      syncPortal(item);
      return json(detailed(item), 201);
    }
    const item = state.milestones.find(
      (item) => item.id === id && milestoneVisible(item.id),
    );
    if (!item) throw new NotFoundError();
    if (method === 'PUT' && !action) {
      const input = MilestoneGuidanceInputSchema.parse(await body(request));
      replaceOptions(item, input.response_options);
      Object.assign(item, {
        milestone: input.milestone,
        information: input.information,
        observation_guidance: input.observation_guidance,
        tags: input.tags,
      });
      syncPortal(item);
      return json(detailed(item));
    }
    if (action === 'response-options' && method === 'PUT' && !subaction) {
      const input = MilestoneGuidanceInputSchema.pick({
        response_options: true,
      })
        .strict()
        .parse(await body(request));
      replaceOptions(item, input.response_options);
      return json(detailed(item));
    }
    if (
      action === 'response-options' &&
      subaction === 'order' &&
      method === 'PATCH'
    ) {
      const input = z
        .object({ option_ids: z.array(z.string()).max(100) })
        .strict()
        .parse(await body(request));
      const options = (item.response_options ?? []).filter(
        (option) => !option.deleted,
      );
      if (
        input.option_ids.length !== options.length ||
        new Set(input.option_ids).size !== options.length ||
        input.option_ids.some(
          (id) => !options.some((option) => option.id === id),
        )
      )
        throw new ValidationError(copy.validation.invalidOption);
      replaceOptions(
        item,
        input.option_ids.map((id) =>
          options.find((option) => option.id === id)!,
        ),
      );
      return json(detailed(item));
    }
    if (method === 'DELETE' && !action) {
      state.hiddenMilestoneIds.add(item.id);
      portal.milestones = portal.milestones.filter(
        (milestone) => milestone.id !== item.id,
      );
      return noContent();
    }
    throw new NotFoundError();
  }
  const visibleTips = state.tips.filter(
    (tip) => !tip.deleted && milestoneVisible(tip.milestone_id),
  );
  const project = (tip: FamilyTip, privateReview: boolean): FamilyTip => {
    const author = accounts.users.find(
      (user) => user.id === tip.user_id && !user.deleted,
    );
    const result: FamilyTip = {
      ...tip,
      user_id: author?.id ?? null,
      author: author
        ? {
            id: author.id,
            first_name: author.first_name,
            last_name: author.last_name,
          }
        : null,
    };
    // Never serialize the demo tombstone or private review into public results.
    const { review, ...publicTip } = result;
    const projected = {
      id: publicTip.id,
      content_type: publicTip.content_type,
      milestone_id: publicTip.milestone_id,
      user_id: publicTip.user_id,
      message: publicTip.message,
      approval_status: publicTip.approval_status,
      author: publicTip.author,
      created_at: publicTip.created_at,
      updated_at: publicTip.updated_at,
    };
    return privateReview ? { ...projected, review } : projected;
  };
  if (area === 'portal' && method === 'GET' && !action) {
    if (!id || id === 'mine' || id === 'review-queue') {
      const own = id === 'mine',
        review = id === 'review-queue';
      if (review && !staff) throw new OwnershipError();
      if (
        own &&
        url.searchParams.has('user_id') &&
        url.searchParams.get('user_id') !== actor.id
      )
        throw new OwnershipError();
      const input = query();
      const scope = visibleTips.filter((tip) =>
        own
          ? tip.user_id === actor.id
          : review ||
            (tip.approval_status === 'APPROVED' && userAvailable(tip.user_id)),
      );
      return page(
        scope
          .filter(
            (tip) =>
              (!input.query ||
                tip.message
                  .toLowerCase()
                  .includes(input.query.toLowerCase())) &&
              (!input.milestone_id ||
                tip.milestone_id === input.milestone_id) &&
              (!input.approval_status ||
                tip.approval_status === input.approval_status) &&
              (!input.tag ||
                state.milestones
                  .find((milestone) => milestone.id === tip.milestone_id)
                  ?.tags.includes(input.tag)) &&
              (!url.searchParams.get('user_id') ||
                tip.user_id === url.searchParams.get('user_id')) &&
              (!url.searchParams.get('reviewed_by_user_id') ||
                tip.review?.reviewed_by_user_id ===
                  url.searchParams.get('reviewed_by_user_id')) &&
              dateMatches(tip.created_at, 'created') &&
              dateMatches(tip.review?.reviewed_at, 'reviewed'),
          )
          .map((tip) => project(tip, own || review)),
      );
    }
    const tip = visibleTips.find((tip) => tip.id === id);
    if (
      !tip ||
      (!(tip.approval_status === 'APPROVED' && userAvailable(tip.user_id)) &&
        tip.user_id !== actor.id &&
        !staff)
    )
      throw new NotFoundError();
    return json(project(tip, staff || tip.user_id === actor.id));
  }
  if (area === 'portal' && method === 'POST' && !id) {
    const input = FamilyTipInputSchema.parse(await body(request));
    if (!milestoneVisible(input.milestone_id))
      throw new ValidationError(copy.validation.unavailableMilestone);
    const now = new Date().toISOString();
    const tip = {
      ...input,
      id: crypto.randomUUID(),
      content_type: 'TIP' as const,
      user_id: actor.id,
      author: {
        id: actor.id,
        first_name: actor.first_name,
        last_name: actor.last_name,
      },
      approval_status: 'PENDING' as const,
      created_at: now,
      updated_at: now,
      deleted: false,
      review: {
        reviewed_by_user_id: null,
        reviewed_at: null,
        review_notes: null,
      },
    };
    state.tips.push(tip);
    return json(project(tip, true), 201);
  }
  const tip = visibleTips.find((tip) => tip.id === id);
  if (!tip) throw new NotFoundError();
  if (area === 'admin' && action === 'review' && method === 'PATCH') {
    const input = TipReviewInputSchema.parse(await body(request));
    if (tip.approval_status === input.approval_status)
      throw new ApiError(copy.validation.repeatedReview, 409);
    const now = new Date().toISOString();
    Object.assign(tip, {
      approval_status: input.approval_status,
      updated_at: now,
      review: {
        reviewed_by_user_id: actor.id,
        reviewed_at: now,
        review_notes: input.review_notes,
      },
    });
    return json(project(tip, true));
  }
  if (area !== 'portal' || action) throw new NotFoundError();
  if (tip.user_id !== actor.id) throw new OwnershipError();
  if (method === 'PUT') {
    const input = FamilyTipUpdateSchema.parse(await body(request));
    Object.assign(tip, {
      message: input.message,
      approval_status: 'PENDING',
      updated_at: new Date().toISOString(),
      review: {
        reviewed_by_user_id: null,
        reviewed_at: null,
        review_notes: null,
      },
    });
    return json(project(tip, true));
  }
  if (method === 'DELETE') {
    tip.deleted = true;
    return noContent();
  }
  throw new NotFoundError();
}
