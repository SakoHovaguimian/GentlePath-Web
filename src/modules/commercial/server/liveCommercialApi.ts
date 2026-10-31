import 'server-only';
import { readSortedDiscountOffers } from './readSortedDiscountOffers';
import { commercialDestination } from './commercialDestination';
import {
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { CommercialEntitySchema } from '../models/commercialEntity';
import { AdPlacementKeySchema } from '../models/adPlacement';

/** The backend owns validation, eligibility snapshots, review attribution, and soft deletion. */
export async function handleLiveCommercialRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  userId?: string,
  role?: string,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, module, entity, id, action, tail, extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (!['portal', 'admin'].includes(area ?? '') || module !== 'commercial')
    return null;
  if (!userId) throw new AuthError();
  const method = request.method;
  let target: string | undefined;
  if (area === 'portal') {
    if (entity === 'offers' && !id && method === 'GET')
      return readSortedDiscountOffers(request, url.searchParams, forward);
    if (entity === 'destination' && !id && method === 'GET')
      return Response.json(
        await commercialDestination(url.searchParams, false, request, forward),
        { headers: { 'cache-control': 'no-store' } },
      );
    if (
      entity === 'offers' &&
      !action &&
      (!id || /^[0-9a-f-]{36}$/i.test(id)) &&
      method === 'GET'
    )
      target = `/discount-offers${id ? `/${id}` : ''}`;
    if (
      entity === 'placements' &&
      id === 'key' &&
      AdPlacementKeySchema.safeParse(action).success &&
      !tail &&
      method === 'GET'
    )
      target = `/ad-placements/key/${action}`;
    if (entity === 'metrics' && !id && method === 'POST')
      target = '/ad-metrics';
  } else {
    if (!['admin', 'superadmin', 'ADMIN', 'SUPER_ADMIN'].includes(role ?? ''))
      throw new OwnershipError(copy.validation.forbidden);
    if (entity === 'metrics' && !id && method === 'GET') target = '/ad-metrics';
    const parsed = CommercialEntitySchema.safeParse(entity);
    if (parsed.success) {
      const roots = {
        sponsors: '/sponsors',
        offers: '/discount-offers',
        campaigns: '/ad-campaigns',
        creatives: '/ad-creatives',
        placements: '/ad-placements',
      };
      const root = roots[parsed.data];
      if (id && !/^[0-9a-f-]{36}$/i.test(id)) throw new ValidationError();
      if (
        !action &&
        ((!id && ['GET', 'POST'].includes(method)) ||
          (id && ['GET', 'PUT', 'DELETE'].includes(method)))
      )
        target = `${root}${entity === 'offers' && method === 'GET' ? '/admin' : ''}${id ? `/${id}` : ''}`;
      if (
        id &&
        action &&
        !tail &&
        method === 'PATCH' &&
        ((action === 'review' && entity !== 'placements') ||
          (action === 'verification' && entity === 'offers') ||
          (action === 'enablement' &&
            ['offers', 'campaigns', 'creatives'].includes(entity)))
      )
        target = `${root}/${id}/${action}`;
      if (
        entity === 'placements' &&
        id &&
        action === 'items' &&
        !extra &&
        ((!tail && ['GET', 'PUT'].includes(method)) ||
          (tail === 'order' && method === 'PUT'))
      )
        target = `${root}/${id}/items${tail ? '/order' : ''}`;
    }
  }
  if (
    !target ||
    extra ||
    (tail &&
      !(entity === 'placements' && action === 'items' && tail === 'order'))
  )
    throw new NotFoundError();
  return forward(request, `${target}${url.search}`);
}
