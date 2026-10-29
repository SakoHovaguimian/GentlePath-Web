import 'server-only';
import { z } from 'zod';
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { gentlePathEngagementStrings as copy } from '@/strings';
import {
  SavedContentTypeSchema,
  type SavedContentType,
} from '../models/savedContentType';
import { SavedContentQuerySchema } from '../models/savedContentQuery';
import { ResourceRatingInputSchema } from '../models/resourceEngagement';
import { EngagementPageMetadataSchema } from '../models/engagementPageMetadata';
import {
  FavoriteTransportSchema,
  type FavoriteTransport,
} from './models/favoriteTransport';
import { ResourceRatingTransportSchema } from './models/resourceRatingTransport';
import { BlogLikeTransportSchema } from './models/blogLikeTransport';
import { savedContentReaderPath } from '../savedContentReaderPath';
import type { SavedContent } from '../models/savedContent';
class UpstreamResponse extends Error {
  constructor(readonly response: Response) {
    super();
  }
}
const json = (body: unknown) =>
  Response.json(body, { headers: { 'cache-control': 'no-store' } });
const pageSchema = <T extends z.ZodType>(schema: T) =>
  z.object({ data: z.array(schema), page: EngagementPageMetadataSchema });
const resourceSummarySchema = z.object({
  ratings: z
    .object({
      count: z.number().int().nonnegative(),
      average: z.number().min(1).max(5).nullable(),
    })
    .optional(),
});
const blogSummarySchema = z.object({
  likes_count: z.number().int().nonnegative().optional(),
});
/** Called only behind the authenticated proxy; it owns identity and token refresh. */
export async function handleLiveEngagementRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  _userId?: string,
): Promise<Response | null> {
  void _userId;
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, collection, id, action, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || feature !== 'engagement') return null;
  if (extra.length) throw new NotFoundError();
  const method = request.method;
  async function call(upstreamPath: string, verb = 'GET', body?: unknown) {
    const headers = new Headers({ accept: 'application/json' });
    if (body !== undefined) headers.set('content-type', 'application/json');
    const response = await forward(
      new Request(request.url, {
        method: verb,
        headers,
        signal: request.signal,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      upstreamPath,
    );
    if (!response.ok) throw new UpstreamResponse(response);
    return response;
  }
  async function read<T extends z.ZodType>(
    schema: T,
    upstreamPath: string,
  ): Promise<z.output<T>> {
    return schema.parse(await (await call(upstreamPath)).json());
  }
  async function saved(type: SavedContentType, targetId: string) {
    const page = await read(
      pageSchema(FavoriteTransportSchema),
      `/favorites?content_type=${type}&content_id=${encodeURIComponent(targetId)}&limit=1&offset=0`,
    );
    return page.data.some(
      (item) => item.content_type === type && item.content_id === targetId,
    );
  }
  async function mapFavorite(value: FavoriteTransport): Promise<SavedContent> {
    const target = value.target;
    if (
      target &&
      (target.id !== value.content_id ||
        target.content_type !== value.content_type)
    )
      throw new ApiError(copy.unavailableDescription, 502);
    return {
      id: value.id,
      contentType: value.content_type,
      contentId: value.content_id,
      createdAt: value.created_at,
      target: target
        ? {
            id: target.id,
            contentType: target.content_type,
            title: target.title,
            preview: target.preview,
            parentId: target.parent_id,
            readerPath: savedContentReaderPath(
              target.content_type,
              target.id,
              target.parent_id,
              target.slug ?? undefined,
            ),
          }
        : null,
    };
  }
  async function resourceEngagement(targetId: string, allowMissing = false) {
    try {
      const [resource, ratings] = await Promise.all([
        read(resourceSummarySchema, `/resources/${targetId}`),
        read(
          pageSchema(ResourceRatingTransportSchema),
          `/resource-ratings?resource_id=${targetId}&limit=1&offset=0`,
        ),
      ]);
      return {
        rating:
          ratings.data.find((item) => item.resource_id === targetId)?.rating ??
          null,
        ...(resource.ratings ?? { count: 0, average: null }),
      };
    } catch (error) {
      if (!(
        allowMissing &&
        error instanceof UpstreamResponse &&
        error.response.status === 404
      ))
        throw error;
      await error.response.body?.cancel();
      return { rating: null, count: 0, average: null };
    }
  }
  async function blogEngagement(targetId: string, allowMissing = false) {
    try {
      const [blog, likes, isSaved] = await Promise.all([
        read(blogSummarySchema, `/blogs/${targetId}`),
        read(
          pageSchema(BlogLikeTransportSchema),
          `/blog-likes?blog_id=${targetId}&limit=1&offset=0`,
        ),
        saved('BLOG', targetId),
      ]);
      return {
        liked: likes.data.some((like) => like.blog_id === targetId),
        likesCount: blog.likes_count ?? 0,
        saved: isSaved,
      };
    } catch (error) {
      if (!(
        allowMissing &&
        error instanceof UpstreamResponse &&
        error.response.status === 404
      ))
        throw error;
      await error.response.body?.cancel();
      return { liked: false, likesCount: 0, saved: false };
    }
  }
  try {
    if (collection === 'favorites') {
      if (!id && !action && method === 'GET') {
        const query = SavedContentQuerySchema.parse(
          Object.fromEntries(url.searchParams),
        );
        const params = new URLSearchParams({
          query: query.query,
          limit: String(query.limit),
          offset: String(query.offset),
        });
        if (query.contentType) params.set('content_type', query.contentType);
        const page = await read(
          pageSchema(FavoriteTransportSchema),
          `/favorites?${params}`,
        );
        return json({
          data: await Promise.all(page.data.map(mapFavorite)),
          page: page.page,
        });
      }
      if (id && !action && method === 'GET') {
        z.string().uuid().parse(id);
        return json(
          await mapFavorite(
            await read(FavoriteTransportSchema, `/favorites/${id}`),
          ),
        );
      }
      if (id && action) {
        const type = SavedContentTypeSchema.parse(id);
        const targetId = z.string().uuid().parse(action);
        if (method === 'GET')
          return json({ saved: await saved(type, targetId) });
        if (method === 'PUT' || method === 'DELETE') {
          const response = await call(`/favorites/${type}/${targetId}`, method);
          await response.body?.cancel();
          return json({ saved: method === 'PUT' });
        }
      }
    }
    if (collection === 'resources' && id) {
      const targetId = z.string().uuid().parse(id);
      if (!action && method === 'GET')
        return json(await resourceEngagement(targetId));
      if (action === 'rating' && (method === 'PUT' || method === 'DELETE')) {
        const body =
          method === 'PUT'
            ? ResourceRatingInputSchema.parse(
                await request.json().catch(() => {
                  throw new ValidationError();
                }),
              )
            : undefined;
        const response = await call(
          `/resource-ratings/${targetId}`,
          method,
          body,
        );
        await response.body?.cancel();
        return json(await resourceEngagement(targetId, method === 'DELETE'));
      }
    }
    if (collection === 'blogs' && id) {
      const targetId = z.string().uuid().parse(id);
      if (!action && method === 'GET')
        return json(await blogEngagement(targetId));
      if (action === 'like' && (method === 'PUT' || method === 'DELETE')) {
        const response = await call(`/blog-likes/${targetId}`, method);
        await response.body?.cancel();
        return json(await blogEngagement(targetId, method === 'DELETE'));
      }
    }
    throw new NotFoundError();
  } catch (error) {
    if (error instanceof UpstreamResponse) return error.response;
    throw error;
  }
}
