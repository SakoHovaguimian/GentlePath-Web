import 'server-only';
import { z } from 'zod';
import {
  AuthError,
  ApiError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { canManageContent } from '@/services/auth/permissions';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import {
  gentlePathDemoStrings,
  gentlePathEditorialStrings as copy,
} from '@/strings';
import {
  GuideInputSchema,
  GuideItemsInputSchema,
  type Guide,
} from '../models/guide';
import type { GuideItemInput } from '../models/guideItem';
import { GuideOrderSchema } from '../models/guideOrder';
import {
  EditorialResourceInputSchema,
  type EditorialResourceInput,
} from '../models/editorialResource';
import { EditorialQuerySchema } from '../models/editorialQuery';
import {
  getDemoEditorialState,
  getVisibleDemoResources,
  getVisibleDemoGuides,
  syncDemoPortalResources,
} from './demoEditorialState';

export { resetDemoEditorialState } from './demoEditorialState';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const noContent = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
const readInput = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });

function replaceItems(guide: Guide, items: GuideItemInput[]) {
  const now = new Date().toISOString();
  const existing = new Map(guide.items.map((item) => [item.id, item]));
  if (items.some((item) => item.id && !existing.has(item.id)))
    throw new ValidationError(copy.validation.itemOwnershipDescription);
  return items.map((item, position) => ({
    ...item,
    id: item.id ?? crypto.randomUUID(),
    guided_step_id: guide.id,
    position,
    created_at: item.id ? existing.get(item.id)!.created_at : now,
    updated_at: now,
  }));
}

function validateParent(input: EditorialResourceInput, id?: string) {
  const state = getDemoEditorialState();
  if (
    id &&
    input.type !== 'COLLECTION' &&
    state.resources.some((item) => item.parent_id === id)
  )
    throw new ApiError(copy.validation.collectionTypeDescription, 409);
  const resources = getVisibleDemoResources();
  const visited = new Set<string>();
  let parent = input.parent_id;
  while (parent) {
    if (parent === id || visited.has(parent))
      throw new ValidationError(copy.validation.cycleDescription);
    visited.add(parent);
    const record = resources.find((item) => item.id === parent);
    if (!record || record.type !== 'COLLECTION')
      throw new ValidationError(copy.validation.parentDescription);
    parent = record.parent_id;
  }
}

export async function handleEditorialRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const [area, feature] = parts;
  const library = area === 'portal' && feature === 'resources';
  const editorial =
    ['portal', 'admin'].includes(area) && feature === 'editorial';
  if (!library && !editorial) return null;
  const current = getDemoState().users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.disabled &&
      !user.deleted,
  );
  if (!session.demo || !current) throw new AuthError();
  const staff = canManageContent(current.role ?? 'user');
  const portal = getDemoPortalState();
  if (portal.settings.maintenanceMode && !staff)
    throw new ApiError(gentlePathDemoStrings.maintenanceActive, 503);
  const method = request.method;
  const empty = context.scenario === 'empty';

  if (library) {
    if (parts.length > 4) throw new NotFoundError();
    const [, , id, action] = parts;
    syncDemoPortalResources();
    const favorites = portal.favorites.get(current.id) ?? new Set<string>();
    const withSaved = (resource: (typeof portal.resources)[number]) => ({
      ...resource,
      saved: favorites.has(resource.id),
    });
    if (!id && method === 'GET')
      return json(empty ? [] : portal.resources.map(withSaved));
    const resource = portal.resources.find((item) => item.id === id);
    if (!resource) {
      // Removing a saved reference remains possible after its target is hidden.
      if (action === 'favorite' && method === 'POST') {
        const { saved } = z
          .object({ saved: z.boolean() })
          .strict()
          .parse(await readInput(request));
        if (!saved) {
          favorites.delete(id);
          portal.favorites.set(current.id, favorites);
          return noContent();
        }
      }
      throw new NotFoundError();
    }
    if (!action && method === 'GET') return json(withSaved(resource));
    if (action === 'favorite' && method === 'POST') {
      const { saved } = z
        .object({ saved: z.boolean() })
        .strict()
        .parse(await readInput(request));
      if (saved) favorites.add(id);
      else favorites.delete(id);
      portal.favorites.set(current.id, favorites);
      return json(withSaved(resource));
    }
    throw new NotFoundError();
  }

  if ((area === 'admin' || method !== 'GET') && !staff)
    throw new OwnershipError();
  if (method !== 'GET' && area !== 'admin') throw new OwnershipError();
  const [, , resource, id, action, subaction, ...extra] = parts;
  if (extra.length || !['guides', 'resources'].includes(resource))
    throw new NotFoundError();
  const state = getDemoEditorialState();
  if (!id && method === 'GET') {
    const query = EditorialQuerySchema.parse({
      ...Object.fromEntries(url.searchParams),
      root_only: url.searchParams.get('root_only') === 'true' || undefined,
    });
    const all =
      resource === 'guides'
        ? getVisibleDemoGuides()
        : getVisibleDemoResources();
    const filtered = empty
      ? []
      : all
          .filter((item) => {
            if (
              !`${item.title} ${item.description}`
                .toLocaleLowerCase()
                .includes(query.query.toLocaleLowerCase())
            )
              return false;
            if (item.content_type === 'RESOURCE')
              return (
                (!query.type || item.type === query.type) &&
                (!query.parent_id || item.parent_id === query.parent_id) &&
                (!query.root_only || item.parent_id === null)
              );
            return true;
          })
          .sort(
            (a, b) =>
              b.created_at.localeCompare(a.created_at) ||
              a.id.localeCompare(b.id),
          );
    const data = filtered.slice(query.offset, query.offset + query.limit);
    const hasMore = query.offset + query.limit < filtered.length;
    return json({
      data,
      page: {
        limit: query.limit,
        offset: query.offset,
        hasMore,
        nextOffset: hasMore ? query.offset + query.limit : null,
      },
    });
  }
  if (resource === 'guides') {
    if (!id && method === 'POST' && !action) {
      const input = GuideInputSchema.parse(await readInput(request));
      if (input.items.some((item) => item.id))
        throw new ValidationError(copy.validation.itemOwnershipDescription);
      const now = new Date().toISOString();
      const guide: Guide = {
        ...input,
        id: crypto.randomUUID(),
        content_type: 'GUIDED_STEP',
        items: [],
        created_at: now,
        updated_at: now,
      };
      guide.items = replaceItems(guide, input.items);
      state.guides.push(guide);
      return json(guide, 201);
    }
    const guide = getVisibleDemoGuides().find((item) => item.id === id);
    if (!guide) throw new NotFoundError();
    if (!action && !subaction) {
      if (method === 'GET') return json(guide);
      if (method === 'PUT') {
        const input = GuideInputSchema.parse(await readInput(request));
        const items = replaceItems(guide, input.items);
        Object.assign(guide, input, {
          items,
          updated_at: new Date().toISOString(),
        });
        return json(guide);
      }
      if (method === 'DELETE') {
        state.deletedGuides.add(guide.id);
        return noContent();
      }
    }
    if (action === 'items' && method === 'PUT') {
      if (!subaction)
        guide.items = replaceItems(
          guide,
          GuideItemsInputSchema.parse(await readInput(request)).items,
        );
      else if (subaction === 'order') {
        const { item_ids } = GuideOrderSchema.parse(await readInput(request));
        if (
          item_ids.length !== guide.items.length ||
          item_ids.some(
            (itemId) => !guide.items.some((item) => item.id === itemId),
          )
        )
          throw new ValidationError(copy.validation.itemOwnershipDescription);
        guide.items = item_ids.map((itemId, position) => ({
          ...guide.items.find((item) => item.id === itemId)!,
          position,
          updated_at: new Date().toISOString(),
        }));
      } else throw new NotFoundError();
      guide.updated_at = new Date().toISOString();
      return json(guide);
    }
  }
  if (resource === 'resources' && !action && !subaction) {
    if (!id && method === 'POST') {
      const input = EditorialResourceInputSchema.parse(
        await readInput(request),
      );
      validateParent(input);
      const now = new Date().toISOString();
      const item = {
        ...input,
        id: crypto.randomUUID(),
        content_type: 'RESOURCE' as const,
        created_at: now,
        updated_at: now,
        resource_details: {
          ...input.resource_details,
          reviewed_at: now,
          reviewed_by_user_id: current.id,
        },
        ratings: { count: 0, average: null },
        children_count: 0,
      };
      state.resources.push(item);
      syncDemoPortalResources();
      return json(item, 201);
    }
    const resource = state.resources.find(
      (item) =>
        item.id === id &&
        getVisibleDemoResources().some((visible) => visible.id === id),
    );
    if (!resource) throw new NotFoundError();
    if (method === 'GET')
      return json(getVisibleDemoResources().find((item) => item.id === id));
    if (method === 'PUT') {
      const input = EditorialResourceInputSchema.parse(
        await readInput(request),
      );
      validateParent(input, id);
      const now = new Date().toISOString();
      Object.assign(resource, input, {
        updated_at: now,
        resource_details: {
          ...input.resource_details,
          reviewed_at: now,
          reviewed_by_user_id: current.id,
        },
      });
      syncDemoPortalResources();
      return json(getVisibleDemoResources().find((item) => item.id === id));
    }
    if (method === 'DELETE') {
      state.deletedResources.add(resource.id);
      syncDemoPortalResources();
      return noContent();
    }
  }
  throw new NotFoundError();
}
