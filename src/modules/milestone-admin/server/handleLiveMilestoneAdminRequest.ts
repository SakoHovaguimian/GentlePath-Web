import 'server-only';
import type { BackendForward } from '@/services/api/models/backendForward';

/** The authenticated backend remains authoritative for roles, ownership and history. */
export async function handleLiveMilestoneAdminRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  userId?: string,
): Promise<Response | null> {
  void userId; // The forwarded server session supplies the backend actor.
  const url = new URL(path, 'http://gentlepath.internal');
  const parts = url.pathname.split('/').filter(Boolean);
  const [area, resource, id, action, subaction] = parts;
  let upstream: string | undefined;
  if (
    area === 'portal' &&
    resource === 'milestone-observations' &&
    parts.length <= 3 &&
    ((!id && ['GET', 'POST'].includes(request.method)) ||
      (id && ['GET', 'PUT', 'DELETE'].includes(request.method)))
  )
    upstream = `/milestone-observations${id ? `/${id}` : ''}`;
  if (
    area === 'portal' &&
    resource === 'milestone-tools' &&
    parts.length <= 3 &&
    request.method === 'GET'
  )
    upstream = `/milestones${id ? `/${id}` : ''}`;
  if (
    area === 'admin' &&
    resource === 'milestone-tools' &&
    parts.length <= 5 &&
    ((!id && request.method === 'POST') ||
      (id && !action && ['PUT', 'DELETE'].includes(request.method)) ||
      (id &&
        action === 'response-options' &&
        ((!subaction && request.method === 'PUT') ||
          (subaction === 'order' && request.method === 'PATCH'))))
  )
    upstream = `/milestones${id ? `/${id}` : ''}${action ? `/${action}` : ''}${subaction ? `/${subaction}` : ''}`;
  if (
    area === 'portal' &&
    resource === 'tips' &&
    parts.length <= 3 &&
    ((!id && ['GET', 'POST'].includes(request.method)) ||
      (id &&
        !['mine', 'review-queue'].includes(id) &&
        ['GET', 'PUT', 'DELETE'].includes(request.method)) ||
      (['mine', 'review-queue'].includes(id) && request.method === 'GET'))
  )
    upstream = `/tips${id ? `/${id}` : ''}`;
  if (
    area === 'admin' &&
    resource === 'tips' &&
    id &&
    action === 'review' &&
    parts.length === 4 &&
    request.method === 'PATCH'
  )
    upstream = `/tips/${id}/review`;
  if (!upstream) return null;
  return forward(request, `${upstream}${url.search}`);
}
