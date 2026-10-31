import 'server-only';
import type { BackendForward } from '@/services/api/models/backendForward';
import { NotFoundError } from '@/errors/domainErrors';

export async function handleLiveStateBenefitsRequest(
  request: Request,
  path: string,
  forward: BackendForward,
): Promise<Response | null> {
  const pathname = new URL(path, 'http://gentlepath.internal').pathname;
  if (
    pathname !== '/portal/state-benefits' &&
    !pathname.startsWith('/portal/state-benefits/')
  )
    return null;
  if (request.method !== 'GET') throw new NotFoundError();
  return forward(
    request,
    pathname.replace('/portal/state-benefits', '/state-benefits'),
  );
}
