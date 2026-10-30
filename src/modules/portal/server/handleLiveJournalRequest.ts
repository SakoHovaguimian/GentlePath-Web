import 'server-only';
import { z } from 'zod';
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { gentlePathPortalStrings as copy, strings } from '@/strings';
import { JournalEntrySchema, JournalInputSchema } from '../models/journalEntry';
import {
  JournalTransportSchema,
  type JournalTransport,
} from '../models/journalTransport';
import { JournalTransportPageSchema } from '../models/journalTransportPage';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

function mapJournal(value: JournalTransport, userId: string) {
  if (value.user_id !== userId) throw new NotFoundError();
  return JournalEntrySchema.parse({
    id: value.id,
    userId: value.user_id,
    childId: value.child_id,
    title: value.title ?? copy.journal.untitledTitle,
    body: value.message ?? '',
    emotions: value.emotions,
    createdAt: value.created_at,
    updatedAt: value.updated_at,
  });
}

export async function handleLiveJournalRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  userId: string,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, resource, id, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || resource !== 'journals') return null;
  if (extra.length) throw new NotFoundError();
  const upstreamPath = `/journals${id ? `/${encodeURIComponent(z.string().uuid().parse(id))}` : ''}`;

  if (!id && request.method === 'GET') {
    const entries = [];
    let offset = 0;
    for (let index = 0; index < 1000; index++) {
      const response = await forward(
        request,
        `${upstreamPath}?limit=100&offset=${offset}`,
      );
      if (!response.ok) return response;
      const result = JournalTransportPageSchema.parse(await response.json());
      entries.push(...result.data.map((entry) => mapJournal(entry, userId)));
      if (!result.page.hasMore) return json(entries);
      if (result.page.nextOffset === null || result.page.nextOffset <= offset)
        throw new ApiError(strings.errors.unavailable, 502);
      offset = result.page.nextOffset;
    }
    throw new ApiError(strings.errors.unavailable, 502);
  }
  if (id && request.method === 'GET') {
    const response = await forward(request, upstreamPath);
    return response.ok
      ? json(
          mapJournal(
            JournalTransportSchema.parse(await response.json()),
            userId,
          ),
        )
      : response;
  }
  if (
    (!id && request.method === 'POST') ||
    (id && request.method === 'PATCH')
  ) {
    const body = await request.json().catch(() => {
      throw new ValidationError();
    });
    const input = JournalInputSchema.parse(body);
    const childId = z.string().uuid().nullable().parse(input.childId);
    const response = await forward(
      new Request(request.url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        signal: request.signal,
        body: JSON.stringify({
          title: input.title,
          message: input.body,
          emotions: input.emotions,
          child_id: childId,
        }),
      }),
      upstreamPath,
    );
    return response.ok
      ? json(
          mapJournal(
            JournalTransportSchema.parse(await response.json()),
            userId,
          ),
          id ? 200 : 201,
        )
      : response;
  }
  if (id && request.method === 'DELETE') {
    const response = await forward(request, upstreamPath);
    return response.ok
      ? new Response(null, {
          status: 204,
          headers: { 'cache-control': 'no-store' },
        })
      : response;
  }
  throw new NotFoundError();
}
