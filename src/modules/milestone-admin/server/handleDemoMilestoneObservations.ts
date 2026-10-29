import 'server-only';
import { z } from 'zod';
import {
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import {
  MilestoneObservationInputSchema,
  MilestoneObservationUpdateSchema,
  type MilestoneObservation,
} from '../models/milestoneObservation';
import { MilestoneObservationQuerySchema } from '../models/milestoneObservationQuery';
import { getDemoMilestoneAdminState } from './demoMilestoneAdminState';
const json = (value: unknown, status = 200) =>
  Response.json(value, { status, headers: { 'cache-control': 'no-store' } });
const body = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });
export async function handleDemoMilestoneObservations(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [, , id, extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (extra) throw new NotFoundError();
  const actor = getDemoState().users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.disabled &&
      !user.deleted,
  );
  if (!session.demo || !actor) throw new AuthError();
  const state = getDemoMilestoneAdminState();
  const children = getDemoPortalState().children.filter(
    (child) => child.userId === actor.id,
  );
  const ownChild = (childId: string) => {
    if (!children.some((child) => child.id === childId))
      throw new OwnershipError();
  };
  const visibleMilestone = (milestoneId: string) =>
    state.milestones.find(
      (milestone) =>
        milestone.id === milestoneId &&
        !state.hiddenMilestoneIds.has(milestone.id),
    );
  const visible = state.observations.filter(
    (observation) =>
      !observation.deleted &&
      children.some((child) => child.id === observation.child_id) &&
      visibleMilestone(observation.milestone_id),
  );
  const detailed = (
    observation: MilestoneObservation,
  ): MilestoneObservation => ({
    ...observation,
    response_option: visibleMilestone(
      observation.milestone_id,
    )?.response_options?.find(
      (option) => option.id === observation.response_option_id,
    ),
  });
  if (!id && request.method === 'GET') {
    const parsed = MilestoneObservationQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!parsed.success)
      throw new ValidationError(copy.validation.invalidQuery);
    const input = parsed.data;
    if (input.child_id) ownChild(input.child_id);
    const query = url.searchParams;
    for (const [after, before] of [
      ['created_after', 'created_before'],
      ['observed_after', 'observed_before'],
    ]) {
      const start = query.get(after),
        end = query.get(before);
      if (
        (start &&
          !z.string().datetime({ offset: true }).safeParse(start).success) ||
        (end &&
          !z.string().datetime({ offset: true }).safeParse(end).success) ||
        (start && end && Date.parse(start) > Date.parse(end))
      )
        throw new ValidationError(copy.validation.invalidQuery);
    }
    const dateMatches = (value: string, prefix: 'created' | 'observed') =>
      (!query.get(`${prefix}_after`) ||
        Date.parse(value) >= Date.parse(query.get(`${prefix}_after`)!)) &&
      (!query.get(`${prefix}_before`) ||
        Date.parse(value) <= Date.parse(query.get(`${prefix}_before`)!));
    const filtered =
      context.scenario === 'empty'
        ? []
        : visible
            .filter(
              (observation) =>
                (!input.child_id || input.child_id === observation.child_id) &&
                (!input.milestone_id ||
                  input.milestone_id === observation.milestone_id) &&
                (!query.get('query') ||
                  observation.notes
                    ?.toLowerCase()
                    .includes(query.get('query')!.toLowerCase())) &&
                (!query.get('response_option_id') ||
                  observation.response_option_id ===
                    query.get('response_option_id')) &&
                (!query.get('recorded_by_user_id') ||
                  observation.recorded_by_user_id ===
                    query.get('recorded_by_user_id')) &&
                (!query.get('tag') ||
                  visibleMilestone(observation.milestone_id)?.tags.includes(
                    query.get('tag')!,
                  )) &&
                dateMatches(observation.created_at, 'created') &&
                dateMatches(observation.observed_at, 'observed'),
            )
            .sort(
              (a, b) =>
                Date.parse(b.observed_at) - Date.parse(a.observed_at) ||
                b.id.localeCompare(a.id),
            );
    const data = filtered
      .slice(input.offset, input.offset + input.limit)
      .map(detailed);
    const hasMore = input.offset + data.length < filtered.length;
    return json({
      data,
      page: {
        limit: input.limit,
        offset: input.offset,
        hasMore,
        nextOffset: hasMore ? input.offset + input.limit : null,
      },
    });
  }
  if (!id && request.method === 'POST') {
    const input = MilestoneObservationInputSchema.parse(await body(request));
    ownChild(input.child_id);
    const milestone = visibleMilestone(input.milestone_id);
    const option = milestone?.response_options?.find(
      (option) => option.id === input.response_option_id && !option.deleted,
    );
    if (!option) throw new ValidationError(copy.observationResponseError);
    const now = new Date().toISOString();
    const observation: MilestoneObservation = {
      ...input,
      observed_at: new Date(input.observed_at).toISOString(),
      id: crypto.randomUUID(),
      recorded_by_user_id: actor.id,
      deleted: false,
      created_at: now,
      updated_at: now,
    };
    state.observations.push(observation);
    state.referencedOptionIds.add(option.id);
    return json(detailed(observation), 201);
  }
  const observation = visible.find((observation) => observation.id === id);
  if (!observation) throw new NotFoundError();
  if (request.method === 'GET') return json(detailed(observation));
  if (request.method === 'PUT') {
    const input = MilestoneObservationUpdateSchema.parse(await body(request));
    const option = visibleMilestone(
      observation.milestone_id,
    )?.response_options?.find(
      (option) =>
        option.id === input.response_option_id &&
        (!option.deleted || observation.response_option_id === option.id),
    );
    if (!option) throw new ValidationError(copy.observationResponseError);
    Object.assign(observation, input, {
      observed_at: new Date(input.observed_at).toISOString(),
      updated_at: new Date().toISOString(),
    });
    state.referencedOptionIds.add(option.id);
    return json(detailed(observation));
  }
  if (request.method === 'DELETE') {
    observation.deleted = true;
    observation.updated_at = new Date().toISOString();
    return new Response(null, {
      status: 204,
      headers: { 'cache-control': 'no-store' },
    });
  }
  throw new NotFoundError();
}
