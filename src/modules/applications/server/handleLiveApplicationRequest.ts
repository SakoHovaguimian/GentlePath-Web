import 'server-only';
import { z } from 'zod';
import {
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import {
  ServiceApplicationSchema,
  ServiceApplicationCreateSchema,
  ServiceApplicationUpdateSchema,
} from '../models/serviceApplication';
import {
  ApplicationFollowUpSchema,
  ApplicationFollowUpCreateSchema,
  ApplicationFollowUpUpdateSchema,
  ApplicationFollowUpCompletionSchema,
} from '../models/applicationFollowUp';
import { ApplicationPriorityQuerySchema } from '../models/applicationPriorityQuery';
import { ApplicationQuerySchema } from '../models/applicationQuery';
import {
  ApplicationPageSchema,
  ApplicationPriorityPageSchema,
} from '../models/applicationPage';

export async function handleLiveApplicationRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  userId?: string,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, id, section, followUpId, action, ...extra] =
    url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (area !== 'portal' || feature !== 'applications') return null;
  if (extra.length) throw new NotFoundError();
  const method = request.method;
  const readInput = () =>
    request.json().catch(() => {
      throw new ValidationError();
    });
  let schema: z.ZodType = ServiceApplicationSchema;
  let body: unknown;
  let target = '/applications';
  if (!id && method === 'GET') {
    const personal = url.searchParams.get('personal_only');
    if (personal !== null && !['true', 'false'].includes(personal))
      throw new ValidationError();
    const query = ApplicationQuerySchema.parse({
      ...Object.fromEntries(url.searchParams),
      personal_only: personal === 'true',
    });
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.query) params.set('query', query.query);
    if (query.child_id)
      params.set('child_id', z.string().uuid().parse(query.child_id));
    if (query.personal_only) params.set('personal_only', 'true');
    if (query.status) params.set('status', query.status);
    target += `?${params}`;
    schema = ApplicationPageSchema;
  } else if (id === 'priority-follow-ups' && !section && method === 'GET') {
    const query = ApplicationPriorityQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );
    target += `/priority-follow-ups?limit=${query.limit}&offset=${query.offset}`;
    schema = ApplicationPriorityPageSchema;
  } else if (!id && method === 'POST') {
    body = ServiceApplicationCreateSchema.parse(await readInput());
  } else if (id) {
    target += `/${z.string().uuid().parse(id)}`;
    if (!section) {
      if (method === 'PUT')
        body = ServiceApplicationUpdateSchema.parse(await readInput());
      else if (method === 'DELETE') schema = z.object({ message: z.string() });
      else if (method !== 'GET') throw new NotFoundError();
    } else if (section === 'follow-ups') {
      schema = ApplicationFollowUpSchema;
      target += '/follow-ups';
      if (!followUpId && !action && method === 'POST')
        body = ApplicationFollowUpCreateSchema.parse(await readInput());
      else if (followUpId) {
        target += `/${z.string().uuid().parse(followUpId)}`;
        if (action === 'completion' && method === 'PUT') {
          target += '/completion';
          body = ApplicationFollowUpCompletionSchema.parse(await readInput());
        } else if (!action && method === 'PUT')
          body = ApplicationFollowUpUpdateSchema.parse(await readInput());
        else if (!action && method === 'DELETE')
          schema = z.object({ message: z.string() });
        else throw new NotFoundError();
      } else throw new NotFoundError();
    } else throw new NotFoundError();
  } else throw new NotFoundError();
  const response = await forward(
    new Request(request.url, {
      method,
      signal: request.signal,
      headers: {
        accept: 'application/json',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    target,
  );
  if (!response.ok) return response;
  const result = schema.parse(await response.json());
  const application = ServiceApplicationSchema.safeParse(result);
  if (userId && application.success && application.data.user_id !== userId)
    throw new OwnershipError();
  const page = ApplicationPageSchema.safeParse(result);
  if (
    userId &&
    page.success &&
    page.data.data.some((item) => item.user_id !== userId)
  )
    throw new OwnershipError();
  return Response.json(result, {
    status: response.status,
    headers: { 'cache-control': 'no-store' },
  });
}
