import 'server-only';
import {
  AuthError,
  ApiError,
  NotFoundError,
  ValidationError,
} from '@/errors/domainErrors';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import {
  gentlePathDemoStrings as demoCopy,
  gentlePathEngagementStrings as copy,
} from '@/strings';
import { SavedContentTypeSchema } from '../models/savedContentType';
import { SavedContentQuerySchema } from '../models/savedContentQuery';
import { ResourceRatingInputSchema } from '../models/resourceEngagement';
import { demoSavedTarget } from './demoSavedTarget';
import {
  getDemoEngagementState,
  getDemoSavedContent,
  isDemoContentSaved,
  setDemoContentSaved,
  getDemoResourceEngagement,
  getDemoBlogEngagement,
} from './engagementState';
export { resetDemoEngagementState } from './engagementState';
const json = (body: unknown) =>
  Response.json(body, { headers: { 'cache-control': 'no-store' } });
export async function handleEngagementRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, collection, id, action, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || feature !== 'engagement') return null;
  if (extra.length) throw new NotFoundError();
  const current = getDemoState().users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.deleted &&
      !user.disabled,
  );
  if (!session.demo || !current) throw new AuthError();
  if (
    getDemoPortalState().settings.maintenanceMode &&
    (current.role ?? 'user') === 'user'
  )
    throw new ApiError(demoCopy.maintenanceActive, 503);
  const method = request.method;
  const state = getDemoEngagementState();
  if (collection === 'favorites') {
    if (!id && !action && method === 'GET') {
      const query = SavedContentQuerySchema.parse(
        Object.fromEntries(url.searchParams),
      );
      const search = query.query.toLocaleLowerCase('en-US');
      const all =
        context.scenario === 'empty'
          ? []
          : getDemoSavedContent(current.id).filter(
              (item) =>
                (!query.contentType ||
                  item.contentType === query.contentType) &&
                `${item.target?.title ?? ''} ${item.target?.preview ?? ''}`
                  .toLocaleLowerCase('en-US')
                  .includes(search),
            );
      const hasMore = query.offset + query.limit < all.length;
      return json({
        data: all.slice(query.offset, query.offset + query.limit),
        page: {
          limit: query.limit,
          offset: query.offset,
          hasMore,
          nextOffset: hasMore ? query.offset + query.limit : null,
        },
      });
    }
    if (id && !action && method === 'GET') {
      const item = getDemoSavedContent(current.id).find(
        (favorite) => favorite.id === id,
      );
      if (!item) throw new NotFoundError(copy.unavailableDescription);
      return json(item);
    }
    if (id && action) {
      const type = SavedContentTypeSchema.parse(id);
      if (method === 'GET')
        return json({
          saved:
            Boolean(demoSavedTarget(type, action)) &&
            isDemoContentSaved(current.id, type, action),
        });
      if (method === 'PUT' || method === 'DELETE') {
        if (method === 'PUT' && !demoSavedTarget(type, action))
          throw new NotFoundError(copy.unavailableDescription);
        setDemoContentSaved(current.id, type, action, method === 'PUT');
        return json({ saved: method === 'PUT' });
      }
    }
    throw new NotFoundError();
  }
  if (collection === 'resources' && id) {
    if (!action && method === 'GET') {
      if (!demoSavedTarget('RESOURCE', id))
        throw new NotFoundError(copy.unavailableDescription);
      return json(getDemoResourceEngagement(current.id, id));
    }
    if (action === 'rating' && (method === 'PUT' || method === 'DELETE')) {
      if (method === 'PUT') {
        if (!demoSavedTarget('RESOURCE', id))
          throw new NotFoundError(copy.unavailableDescription);
        const { rating } = ResourceRatingInputSchema.parse(
          await request.json().catch(() => {
            throw new ValidationError();
          }),
        );
        const existing = state.ratings.find(
          (item) => item.userId === current.id && item.resourceId === id,
        );
        if (existing) existing.rating = rating;
        else state.ratings.push({ userId: current.id, resourceId: id, rating });
      } else
        state.ratings = state.ratings.filter(
          (item) => item.userId !== current.id || item.resourceId !== id,
        );
      return json(getDemoResourceEngagement(current.id, id));
    }
  }
  if (collection === 'blogs' && id) {
    if (!action && method === 'GET') {
      if (!demoSavedTarget('BLOG', id))
        throw new NotFoundError(copy.unavailableDescription);
      return json(getDemoBlogEngagement(current.id, id));
    }
    if (action === 'like' && (method === 'PUT' || method === 'DELETE')) {
      if (method === 'PUT' && !demoSavedTarget('BLOG', id))
        throw new NotFoundError(copy.unavailableDescription);
      const likes = state.blogLikes.get(id) ?? new Set<string>();
      if (method === 'PUT') likes.add(current.id);
      else likes.delete(current.id);
      state.blogLikes.set(id, likes);
      return json(getDemoBlogEngagement(current.id, id));
    }
  }
  throw new NotFoundError();
}
