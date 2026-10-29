import 'server-only';
import { z } from 'zod';
import { NotFoundError, ValidationError } from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { PollInputSchema } from '../models/poll';
import { PollBallotInputSchema } from '../models/pollBallot';
import { PollCommentInputSchema } from '../models/pollComment';
import { PollReactionInputSchema } from '../models/pollReaction';
import {
  PollPagingSchema,
  PollQuerySchema,
  pollQueryParams,
} from '../models/pollQuery';
import { PollPageMetadataSchema } from '../models/pollPageMetadata';
import { PollTransportSchema } from './models/pollTransport';
import { PollBallotTransportSchema } from './models/pollBallotTransport';
import { PollCommentTransportSchema } from './models/pollCommentTransport';
import { mapPoll, mapPollBallot, mapPollComment } from './pollTransportMappers';

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
  z.object({ data: z.array(item), page: PollPageMetadataSchema });

/** The authenticated proxy owns credentials, retries, and session refresh. */
export async function handleLivePollRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  currentUserId?: string,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, id, action, detail, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || feature !== 'polls') return null;
  if (extra.length) throw new NotFoundError();
  const method = request.method;
  const readInput = (): Promise<unknown> =>
    request.json().catch(() => {
      throw new ValidationError();
    });
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
    verb = 'GET',
    body?: unknown,
  ): Promise<z.output<T>> {
    return schema.parse(await (await call(upstreamPath, verb, body)).json());
  }
  async function liked(commentId: string) {
    const page = await read(
      pageSchema(z.object({ comment_id: z.string().uuid() })),
      `/poll-comment-likes?comment_id=${encodeURIComponent(commentId)}&limit=1&offset=0`,
    );
    return page.data.some((like) => like.comment_id === commentId);
  }
  async function comment(value: z.output<typeof PollCommentTransportSchema>) {
    return mapPollComment(value, await liked(value.id));
  }
  try {
    if (id === 'status' && !action && method === 'GET')
      return json({ enabled: true });
    if (id === 'comments' && action) {
      const commentId = z.string().uuid().parse(action);
      if (!detail && method === 'PATCH') {
        const body = PollCommentInputSchema.parse(await readInput());
        return json(
          await comment(
            await read(
              PollCommentTransportSchema,
              `/poll-comments/${commentId}`,
              'PUT',
              body,
            ),
          ),
        );
      }
      if (!detail && method === 'DELETE') {
        await call(`/poll-comments/${commentId}`, 'DELETE');
        return noContent();
      }
      if (detail === 'reaction' && method === 'POST') {
        const body = PollReactionInputSchema.parse(await readInput());
        await call(
          `/poll-comment-likes/${commentId}`,
          body.liked ? 'PUT' : 'DELETE',
        );
        let likesCount = 0;
        try {
          likesCount =
            (
              await read(
                PollCommentTransportSchema,
                `/poll-comments/${commentId}`,
              )
            ).likes_count ?? 0;
        } catch (error) {
          if (!(
            error instanceof UpstreamResponse &&
            !body.liked &&
            error.response.status === 404
          ))
            throw error;
          await error.response.body?.cancel();
        }
        return json({ liked: body.liked, likesCount });
      }
      throw new NotFoundError();
    }
    if (!id && method === 'GET') {
      const query = PollQuerySchema.parse(Object.fromEntries(url.searchParams));
      const params = pollQueryParams({
        query: query.query,
        tag: query.tag,
        selection_mode: query.selectionMode,
        created_after: query.createdAfter,
        created_before: query.createdBefore,
        limit: query.limit,
        offset: query.offset,
      });
      if (query.scope === 'mine') {
        currentUserId ??= (
          await read(z.object({ id: z.string().uuid() }), '/users/profile')
        ).id;
        params.set('user_id', currentUserId);
      }
      const page = await read(
        pageSchema(PollTransportSchema),
        `/polls?${params}`,
      );
      return json({ data: page.data.map(mapPoll), page: page.page });
    }
    if ((!id && method === 'POST') || (id && !action && method === 'PATCH')) {
      if (id) z.string().uuid().parse(id);
      const body = PollInputSchema.parse(await readInput());
      const value = await read(
        PollTransportSchema,
        id ? `/polls/${id}` : '/polls',
        id ? 'PUT' : 'POST',
        {
          title: body.title,
          message: body.message,
          selection_mode: body.selectionMode,
          tags: body.tags,
          options: body.options.map((option) => ({
            ...(option.id ? { id: option.id } : {}),
            option_text: option.text,
          })),
        },
      );
      return json(mapPoll(value), id ? 200 : 201);
    }
    if (!id) throw new NotFoundError();
    z.string().uuid().parse(id);
    if (!action) {
      if (method === 'GET')
        return json(mapPoll(await read(PollTransportSchema, `/polls/${id}`)));
      if (method === 'DELETE') {
        await call(`/polls/${id}`, 'DELETE');
        return noContent();
      }
    }
    if (action === 'ballot' && !detail) {
      if (method === 'GET') {
        const value = await read(
          PollBallotTransportSchema.nullable(),
          `/polls/${id}/ballot`,
        );
        return json(value ? mapPollBallot(value) : null);
      }
      if (method === 'PUT') {
        const body = PollBallotInputSchema.parse(await readInput());
        return json(
          mapPollBallot(
            await read(
              PollBallotTransportSchema,
              `/polls/${id}/ballot`,
              'PUT',
              { option_ids: body.optionIds },
            ),
          ),
        );
      }
      if (method === 'DELETE') {
        await call(`/polls/${id}/ballot`, 'DELETE');
        return noContent();
      }
    }
    if (action === 'comments' && !detail) {
      if (method === 'GET') {
        const paging = PollPagingSchema.parse(
          Object.fromEntries(url.searchParams),
        );
        const page = await read(
          pageSchema(PollCommentTransportSchema),
          `/poll-comments?${pollQueryParams({ ...paging, poll_id: id })}`,
        );
        return json({
          data: await Promise.all(page.data.map(comment)),
          page: page.page,
        });
      }
      if (method === 'POST') {
        const body = PollCommentInputSchema.parse(await readInput());
        return json(
          mapPollComment(
            await read(PollCommentTransportSchema, '/poll-comments', 'POST', {
              poll_id: id,
              body: body.body,
            }),
            false,
          ),
          201,
        );
      }
    }
    throw new NotFoundError();
  } catch (error) {
    if (error instanceof UpstreamResponse) return error.response;
    throw error;
  }
}
