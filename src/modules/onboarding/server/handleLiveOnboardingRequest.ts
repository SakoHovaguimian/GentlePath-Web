import 'server-only';
import type { BackendForward } from '@/services/api/models/backendForward';
import { NotFoundError } from '@/errors/domainErrors';

export async function handleLiveOnboardingRequest(
  request: Request,
  path: string,
  forward: BackendForward,
): Promise<Response | null> {
  const pathname = new URL(path, 'http://gentlepath.internal').pathname;
  const upstream =
    pathname === '/portal/onboarding'
      ? request.method === 'GET'
        ? '/user-settings'
        : request.method === 'PUT'
          ? '/user-settings/onboarding'
          : null
      : pathname === '/portal/family-preferences' && request.method === 'PUT'
        ? '/user-settings/profile-preferences'
        : null;
  if (
    !pathname.startsWith('/portal/onboarding') &&
    !pathname.startsWith('/portal/family-preferences')
  )
    return null;
  if (!upstream) throw new NotFoundError();
  return forward(request, upstream);
}
