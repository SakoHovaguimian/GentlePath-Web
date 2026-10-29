import 'server-only';
import { z } from 'zod';
import { NotFoundError, ValidationError } from '@/errors/domainErrors';
import { CommunityPostInputSchema } from '../models/communityPost';
import { CommunityCommentInputSchema } from '../models/communityComment';
import { CommunityReactionInputSchema } from '../models/communityReaction';
import { CommunityReportInputSchema } from '../models/communityReport';
import { ReportResolutionSchema } from '@/modules/portal/models/moderationReport';
import { CommunityPagingSchema } from '../models/communityPaging';
import { CommunityPostQuerySchema } from '../models/communityPostQuery';
import { CommunityReportQuerySchema } from '../models/communityReportQuery';
import { communityQueryParams } from '../communityQueryParams';
import { CommunityPageMetadataSchema } from '../models/communityPageMetadata';
import { CommunityPostTransportSchema } from './models/communityPostTransport';
import { CommunityCommentTransportSchema } from './models/communityCommentTransport';
import { CommunityReportTransportSchema } from './models/communityReportTransport';
import {
  mapCommunityComment,
  mapCommunityPost,
  mapCommunityReport,
  mapCommunityModerationReport,
} from './communityTransportMappers';

export type CommunityUpstreamForward = (
  request: Request,
  path: string,
) => Promise<Response>;

class UpstreamResponse extends Error {
  constructor(readonly response: Response) {
    super();
  }
}
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const noContent = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({ data: z.array(item), page: CommunityPageMetadataSchema });

/** Called only behind the authenticated backend proxy. forward owns token refresh. */
export async function handleLiveCommunityRequest(
  request: Request,
  path: string,
  forward: CommunityUpstreamForward,
  currentUserId?: string,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, resource, id, action, extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  const staffReports = area === 'admin' && feature === 'reports';
  if (!(area === 'portal' && feature === 'community') && !staffReports)
    return null;
  if (extra || (staffReports && (id || action))) throw new NotFoundError();
  const method = request.method;
  const rawQuery = Object.fromEntries(url.searchParams);
  const readInput = (): Promise<unknown> =>
    request.json().catch(() => {
      throw new ValidationError();
    });
  const call = async (upstreamPath: string, verb = 'GET', body?: unknown) => {
    const headers = new Headers({ accept: 'application/json' });
    if (body !== undefined) headers.set('content-type', 'application/json');
    const key = request.headers.get('idempotency-key');
    if (key) headers.set('idempotency-key', key);
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
  };
  const read = async <T extends z.ZodType>(
    schema: T,
    upstreamPath: string,
    verb = 'GET',
    body?: unknown,
  ): Promise<z.output<T>> =>
    schema.parse(await (await call(upstreamPath, verb, body)).json());
  const liked = async (type: 'posts' | 'comments', targetId: string) => {
    const target = type === 'posts' ? 'post_id' : 'comment_id';
    const endpoint = type === 'posts' ? '/post-likes' : '/post-comment-likes';
    const page = await read(
      pageSchema(z.object({ [target]: z.string() })),
      `${endpoint}?${target}=${encodeURIComponent(targetId)}&limit=1&offset=0`,
    );
    return page.data.some((value) => value[target] === targetId);
  };
  const postWithReaction = async (
    value: z.output<typeof CommunityPostTransportSchema>,
  ) => mapCommunityPost(value, await liked('posts', value.id));
  const commentWithReaction = async (
    value: z.output<typeof CommunityCommentTransportSchema>,
  ) => mapCommunityComment(value, await liked('comments', value.id));
  try {
    if (staffReports) {
      if (!resource && method === 'GET') {
        const page = await read(
          pageSchema(CommunityReportTransportSchema),
          '/reports/review-queue?limit=100&offset=0',
        );
        return json(page.data.map(mapCommunityModerationReport));
      }
      if (resource && method === 'PATCH') {
        const body = ReportResolutionSchema.parse(await readInput());
        const report = await read(
          CommunityReportTransportSchema,
          `/reports/${encodeURIComponent(resource)}/review`,
          'PATCH',
          {
            status: body.status.toUpperCase(),
            resolution_notes: body.resolutionNote,
            hide_target: false,
          },
        );
        return json(mapCommunityModerationReport(report));
      }
      throw new NotFoundError();
    }
    // The current backend has no platform-settings route. Its own authorization
    // remains authoritative; the demo's platform switches are not a live policy.
    if (resource === 'status' && !id && method === 'GET')
      return json({ enabled: true });
    if (resource === 'posts') {
      if (!id && method === 'GET') {
        const query = CommunityPostQuerySchema.parse(rawQuery);
        const params = communityQueryParams({
          query: query.query,
          tag: query.tag,
          limit: query.limit,
          offset: query.offset,
        });
        if (query.scope === 'mine') {
          currentUserId ??= (
            await read(z.object({ id: z.string() }), '/users/profile')
          ).id;
          params.set('user_id', currentUserId);
        }
        const page = await read(
          pageSchema(CommunityPostTransportSchema),
          `/posts?${params}`,
        );
        return json({
          data: await Promise.all(page.data.map(postWithReaction)),
          page: page.page,
        });
      }
      if (!id && method === 'POST') {
        const body = CommunityPostInputSchema.parse(await readInput());
        const post = await read(
          CommunityPostTransportSchema,
          '/posts',
          'POST',
          {
            title: body.title,
            body: body.body,
            image_url: body.imageUrl,
            tags: body.tags,
          },
        );
        return json(mapCommunityPost(post, false), 201);
      }
      if (id && !action) {
        const targetPath = `/posts/${encodeURIComponent(id)}`;
        if (method === 'GET') {
          const [post, hasLiked] = await Promise.all([
            read(CommunityPostTransportSchema, targetPath),
            liked('posts', id),
          ]);
          return json(mapCommunityPost(post, hasLiked));
        }
        if (method === 'PATCH') {
          const body = CommunityPostInputSchema.parse(await readInput());
          const post = await read(
            CommunityPostTransportSchema,
            targetPath,
            'PUT',
            {
              title: body.title,
              body: body.body,
              image_url: body.imageUrl,
              tags: body.tags,
            },
          );
          return json(await postWithReaction(post));
        }
        if (method === 'DELETE') {
          await call(targetPath, 'DELETE');
          return noContent();
        }
      }
      if (id && action === 'comments') {
        if (method === 'GET') {
          const paging = CommunityPagingSchema.parse(rawQuery);
          const params = communityQueryParams({ ...paging, post_id: id });
          const page = await read(
            pageSchema(CommunityCommentTransportSchema),
            `/post-comments?${params}`,
          );
          return json({
            data: await Promise.all(page.data.map(commentWithReaction)),
            page: page.page,
          });
        }
        if (method === 'POST') {
          const body = CommunityCommentInputSchema.parse(await readInput());
          const comment = await read(
            CommunityCommentTransportSchema,
            '/post-comments',
            'POST',
            { post_id: id, body: body.body },
          );
          return json(mapCommunityComment(comment, false), 201);
        }
      }
    }
    if (resource === 'comments' && id && !action) {
      const targetPath = `/post-comments/${encodeURIComponent(id)}`;
      if (method === 'PATCH') {
        const body = CommunityCommentInputSchema.parse(await readInput());
        const comment = await read(
          CommunityCommentTransportSchema,
          targetPath,
          'PUT',
          body,
        );
        return json(await commentWithReaction(comment));
      }
      if (method === 'DELETE') {
        await call(targetPath, 'DELETE');
        return noContent();
      }
    }
    if (
      (resource === 'posts' || resource === 'comments') &&
      id &&
      action === 'reaction' &&
      method === 'POST'
    ) {
      const body = CommunityReactionInputSchema.parse(await readInput());
      const endpoint =
        resource === 'posts' ? '/post-likes' : '/post-comment-likes';
      await call(
        `${endpoint}/${encodeURIComponent(id)}`,
        body.liked ? 'PUT' : 'DELETE',
      );
      let likeCount = 0;
      try {
        const target =
          resource === 'posts'
            ? await read(
                CommunityPostTransportSchema,
                `/posts/${encodeURIComponent(id)}`,
              )
            : await read(
                CommunityCommentTransportSchema,
                `/post-comments/${encodeURIComponent(id)}`,
              );
        likeCount = target.likes_count ?? 0;
      } catch (error) {
        if (!(
          error instanceof UpstreamResponse &&
          error.response.status === 404 &&
          !body.liked
        ))
          throw error;
        await error.response.body?.cancel();
      }
      return json({ liked: body.liked, likeCount });
    }
    if (resource === 'reports' && !id) {
      if (method === 'GET') {
        const query = CommunityReportQuerySchema.parse(rawQuery);
        const params = communityQueryParams({
          query: query.query,
          limit: query.limit,
          offset: query.offset,
          status: query.status?.toUpperCase(),
        });
        const page = await read(
          pageSchema(CommunityReportTransportSchema),
          `/reports?${params}`,
        );
        return json({
          data: page.data.map(mapCommunityReport),
          page: page.page,
        });
      }
      if (method === 'POST') {
        const body = CommunityReportInputSchema.parse(await readInput());
        const report = await read(
          CommunityReportTransportSchema,
          '/reports',
          'POST',
          {
            target_type: body.targetType.toUpperCase(),
            target_id: body.targetId,
            reason: body.reason,
          },
        );
        return json(mapCommunityReport(report), 201);
      }
    }
    throw new NotFoundError();
  } catch (error) {
    if (error instanceof UpstreamResponse) return error.response;
    throw error;
  }
}
