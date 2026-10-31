import 'server-only';
import { GoalStatusInputSchema } from '../models/goalStatusInput';
import { z } from 'zod';
import { NotFoundError, ValidationError } from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { GoalSchema, GoalInputSchema } from '../models/goal';
import { GoalQuerySchema } from '../models/goalQuery';
import { GoalPageSchema } from '../models/goalPage';
import { GoalNoteInputSchema, GoalNoteSchema } from '../models/goalNote';
import { GoalUploadInputSchema } from '../models/goalUploadInput';
import { GoalUploadSchema } from '../models/goalUpload';
import { GoalMediaSchema } from '../models/goalMedia';
import { GoalDownloadSchema } from '../models/goalDownload';

export async function handleLiveGoalRequest(
  request: Request,
  path: string,
  forward: BackendForward,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] !== 'portal' || parts[1] !== 'goals') return null;
  const [, , id, action, subId, subAction, ...extra] = parts;
  if (extra.length) throw new NotFoundError();
  const method = request.method;
  let responseSchema: z.ZodType;
  let input: unknown;
  let upstream = '/goals';
  if (!id && method === 'GET') {
    const query = GoalQuerySchema.parse(Object.fromEntries(url.searchParams));
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.query) params.set('query', query.query);
    if (query.child_id) params.set('child_id', query.child_id);
    if (query.status) params.set('status', query.status);
    upstream += `?${params}`;
    responseSchema = GoalPageSchema;
  } else if (!id && method === 'POST') {
    input = GoalInputSchema.parse(await request.json());
    responseSchema = GoalSchema;
  } else if (id === 'uploads' && !action && method === 'POST') {
    upstream += '/uploads';
    input = GoalUploadInputSchema.parse(await request.json());
    responseSchema = GoalUploadSchema;
  } else if (
    id === 'uploads' &&
    action &&
    z.uuid().safeParse(action).success &&
    !subAction &&
    ((!subId && method === 'DELETE') ||
      (subId === 'complete' && method === 'POST'))
  ) {
    upstream += `/uploads/${action}${subId ? '/complete' : ''}`;
    responseSchema = subId
      ? GoalMediaSchema
      : z.object({ message: z.string() });
  } else if (id && z.uuid().safeParse(id).success) {
    upstream += `/${id}`;
    if (!action && method === 'GET') responseSchema = GoalSchema;
    else if (!action && method === 'PUT') {
      input = GoalInputSchema.parse(await request.json());
      responseSchema = GoalSchema;
    } else if (!action && method === 'DELETE')
      responseSchema = z.object({ message: z.string() });
    else if (action === 'status' && !subId && method === 'PATCH') {
      upstream += '/status';
      input = GoalStatusInputSchema.parse(await request.json());
      responseSchema = GoalSchema;
    } else if (
      action === 'notes' &&
      !subAction &&
      ((!subId && method === 'POST') ||
        (subId &&
          z.uuid().safeParse(subId).success &&
          ['PUT', 'DELETE'].includes(method)))
    ) {
      upstream += `/notes${subId ? `/${subId}` : ''}`;
      if (method !== 'DELETE')
        input = GoalNoteInputSchema.parse(await request.json());
      responseSchema =
        method === 'DELETE'
          ? z.object({ message: z.string() })
          : GoalNoteSchema;
    } else if (
      action === 'media' &&
      subId &&
      z.uuid().safeParse(subId).success &&
      subAction === 'download' &&
      method === 'GET'
    ) {
      const download = url.searchParams.get('download') ?? 'true';
      if (!['true', 'false'].includes(download)) throw new ValidationError();
      upstream += `/media/${subId}/download?download=${download}`;
      responseSchema = GoalDownloadSchema;
    } else throw new NotFoundError();
  } else throw new NotFoundError();
  const source =
    input === undefined
      ? request
      : new Request(request.url, {
          method,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
          signal: request.signal,
        });
  const response = await forward(source, upstream);
  if (!response.ok) return response;
  const body = responseSchema.parse(await response.json());
  return Response.json(body, {
    status: response.status,
    headers: {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}
