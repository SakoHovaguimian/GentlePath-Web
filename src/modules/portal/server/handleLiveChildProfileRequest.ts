import 'server-only';
import { z } from 'zod';
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import {
  ChildProfileTransportSchema,
  type ChildProfileTransport,
} from '@/services/api/models/childProfileTransport';
import { ChildProfileTransportPageSchema } from '@/services/api/models/childProfileTransportPage';
import { strings } from '@/strings';
import {
  ChildProfileInputSchema,
  ChildProfileUpdateSchema,
  ChildProfileSchema,
} from '../models/childProfile';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

function mapChildProfile(child: ChildProfileTransport, userId: string) {
  if (child.user_id !== userId) throw new NotFoundError();
  return ChildProfileSchema.parse({
    id: child.id,
    userId: child.user_id,
    name: child.name,
    dateOfBirth: child.date_of_birth,
    gender: child.gender,
    supportNotes: child.support_notes,
    supportDetails: {
      allergies: child.support_details.allergies,
      communication: child.support_details.communication,
      sensoryNeeds: child.support_details.sensory_needs,
      comfortStrategies: child.support_details.comfort_strategies,
      dailyRoutines: child.support_details.daily_routines,
    },
  });
}

export async function handleLiveChildProfileRequest(
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
  if (area !== 'portal' || resource !== 'children') return null;
  if (extra.length) throw new NotFoundError();
  const upstreamPath = `/child-profiles${id ? `/${encodeURIComponent(z.string().uuid().parse(id))}` : ''}`;

  if (!id && request.method === 'GET') {
    const children = [];
    let offset = 0;
    for (let index = 0; index < 1000; index++) {
      const response = await forward(
        request,
        `${upstreamPath}?limit=100&offset=${offset}`,
      );
      if (!response.ok) return response;
      const result = ChildProfileTransportPageSchema.parse(
        await response.json(),
      );
      children.push(
        ...result.data.map((child) => mapChildProfile(child, userId)),
      );
      if (!result.page.hasMore) return json(children);
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
          mapChildProfile(
            ChildProfileTransportSchema.parse(await response.json()),
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
    const input = (
      id ? ChildProfileUpdateSchema : ChildProfileInputSchema
    ).parse(body);
    const response = await forward(
      new Request(request.url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        signal: request.signal,
        body: JSON.stringify({
          name: input.name,
          date_of_birth: input.dateOfBirth,
          ...(input.gender !== undefined ? { gender: input.gender } : {}),
          support_notes: input.supportNotes,
          support_details: {
            allergies: input.supportDetails.allergies,
            communication: input.supportDetails.communication,
            sensory_needs: input.supportDetails.sensoryNeeds,
            comfort_strategies: input.supportDetails.comfortStrategies,
            daily_routines: input.supportDetails.dailyRoutines,
          },
        }),
      }),
      upstreamPath,
    );
    return response.ok
      ? json(
          mapChildProfile(
            ChildProfileTransportSchema.parse(await response.json()),
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
