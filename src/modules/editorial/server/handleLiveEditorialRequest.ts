import 'server-only';
import { z } from 'zod';
import {
  ApiError,
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { GuideInputSchema, GuideItemsInputSchema } from '../models/guide';
import { GuideOrderSchema } from '../models/guideOrder';
import {
  EditorialResourceSchema,
  EditorialResourceInputSchema,
} from '../models/editorialResource';
import { editorialPageSchema } from '../models/editorialPage';
import { mapEditorialResourceToPortal } from '../services/mapEditorialResourceToPortal';

const FavoriteSchema = z.object({
  content_type: z.string(),
  content_id: z.string(),
});
const json = (body: unknown) =>
  Response.json(body, { headers: { 'cache-control': 'no-store' } });
const input = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });
const withMethod = (request: Request, method: string, body?: unknown) =>
  new Request(request.url, {
    method,
    headers: { 'content-type': 'application/json' },
    signal: request.signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

async function readPages<T extends z.ZodType>(
  request: Request,
  path: string,
  schema: T,
  forward: BackendForward,
): Promise<z.infer<T>[] | Response> {
  const all: z.infer<T>[] = [];
  let offset = 0;
  for (let pageNumber = 0; pageNumber < 1000; pageNumber++) {
    const separator = path.includes('?') ? '&' : '?';
    const response = await forward(
      withMethod(request, 'GET'),
      `${path}${separator}limit=100&offset=${offset}`,
    );
    if (!response.ok) return response;
    const page = editorialPageSchema(schema).parse(await response.json());
    all.push(...page.data);
    if (!page.page.hasMore || page.page.nextOffset === null) return all;
    if (page.page.nextOffset <= offset)
      throw new ApiError(copy.validation.libraryDescription, 502);
    offset = page.page.nextOffset;
  }
  throw new ApiError(copy.validation.libraryDescription, 502);
}

export async function handleLiveEditorialRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  userId?: string,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const [area, feature] = parts;
  if (userId === '') throw new AuthError();
  if (area === 'portal' && feature === 'resources') {
    if (parts.length > 4) throw new NotFoundError();
    const [, , id, action] = parts;
    if (!id && request.method === 'GET') {
      const resources = await readPages(
        request,
        '/resources',
        EditorialResourceSchema,
        forward,
      );
      if (resources instanceof Response) return resources;
      const favorites = await readPages(
        request,
        '/favorites?content_type=RESOURCE',
        FavoriteSchema,
        forward,
      );
      if (favorites instanceof Response) return favorites;
      const saved = new Set(favorites.map((favorite) => favorite.content_id));
      return json(
        resources.map((resource) =>
          mapEditorialResourceToPortal(resource, saved.has(resource.id)),
        ),
      );
    }
    if (id && action === 'favorite' && request.method === 'POST') {
      const { saved } = z
        .object({ saved: z.boolean() })
        .strict()
        .parse(await input(request));
      const updated = await forward(
        withMethod(request, saved ? 'PUT' : 'DELETE'),
        `/favorites/RESOURCE/${encodeURIComponent(id)}`,
      );
      if (!updated.ok) return updated;
      const response = await forward(
        withMethod(request, 'GET'),
        `/resources/${encodeURIComponent(id)}`,
      );
      if (!response.ok) {
        if (!saved && response.status === 404) {
          await response.body?.cancel();
          return new Response(null, {
            status: 204,
            headers: { 'cache-control': 'no-store' },
          });
        }
        return response;
      }
      return json(
        mapEditorialResourceToPortal(
          EditorialResourceSchema.parse(await response.json()),
          saved,
        ),
      );
    }
    if (id && !action && request.method === 'GET') {
      const response = await forward(
        request,
        `/resources/${encodeURIComponent(id)}`,
      );
      if (!response.ok) return response;
      const resource = EditorialResourceSchema.parse(await response.json());
      const favorites = await readPages(
        request,
        `/favorites?content_type=RESOURCE&content_id=${encodeURIComponent(id)}`,
        FavoriteSchema,
        forward,
      );
      if (favorites instanceof Response) return favorites;
      return json(mapEditorialResourceToPortal(resource, favorites.length > 0));
    }
    throw new NotFoundError();
  }
  if (!['portal', 'admin'].includes(area) || feature !== 'editorial')
    return null;
  const [, , resource, id, action, subaction, ...extra] = parts;
  if (extra.length || !['guides', 'resources'].includes(resource))
    throw new NotFoundError();
  if (request.method !== 'GET' && area !== 'admin') throw new OwnershipError();
  const target = resource === 'guides' ? '/guided-steps' : '/resources';
  const targetPath = `${target}${id ? `/${encodeURIComponent(id)}` : ''}`;
  if (!action && !subaction) {
    if (request.method === 'GET')
      return forward(request, `${targetPath}${url.search}`);
    if (
      (!id && request.method === 'POST') ||
      (id && request.method === 'PUT')
    ) {
      const raw = await input(request);
      const body =
        resource === 'guides'
          ? GuideInputSchema.parse(raw)
          : EditorialResourceInputSchema.parse(raw);
      return forward(withMethod(request, request.method, body), targetPath);
    }
    if (id && request.method === 'DELETE') return forward(request, targetPath);
  }
  if (
    resource === 'guides' &&
    id &&
    action === 'items' &&
    request.method === 'PUT'
  ) {
    if (!subaction)
      return forward(
        withMethod(
          request,
          'PUT',
          GuideItemsInputSchema.parse(await input(request)),
        ),
        `${targetPath}/items`,
      );
    if (subaction === 'order')
      return forward(
        withMethod(
          request,
          'PUT',
          GuideOrderSchema.parse(await input(request)),
        ),
        `${targetPath}/items/order`,
      );
  }
  throw new NotFoundError();
}
