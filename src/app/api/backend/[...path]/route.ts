import { NextRequest } from 'next/server';
import { getContainer } from '@/container';
import { getDemoContext } from '@/services/demo/demoRuntime';
import {
  canManageContent,
  canManagePlatform,
} from '@/services/auth/permissions';
import {
  AuthError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import { strings } from '@/strings';
import { errorResponse, trustedMutation } from '@/services/api/routeSafety';
export const runtime = 'nodejs';
async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const container = await getContainer();
  try {
    if (!trustedMutation(request))
      throw new OwnershipError(strings.errors.untrusted);
    const { path } = await context.params;
    if (
      path.some(
        (segment) =>
          !segment ||
          segment === '.' ||
          segment === '..' ||
          /[\\/]/.test(segment),
      )
    )
      throw new ValidationError(strings.errors.invalidPath);
    const session = await container.sessionService.valid();
    if (!session) throw new AuthError(strings.errors.sessionExpired);
    if (
      (path[0] === 'admin' ||
        path[0] === 'blog' ||
        (path[0] === 'users' &&
          path[1] !== 'profile' &&
          path[1] !== session.user.id)) &&
      !canManageContent(session.user.role)
    )
      throw new OwnershipError();
    if (
      path[0] === 'admin' &&
      (path[1] === 'settings' ||
        (path[1] === 'users' && request.method !== 'GET')) &&
      !canManagePlatform(session.user.role)
    )
      throw new OwnershipError();
    const upstreamPath = `/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
    if (container.demoMode)
      return await container.demoApiClient.proxy(
        request,
        upstreamPath,
        session,
        await getDemoContext(),
      );
    const retry = request.clone();
    const response = await container.apiClient.proxy(
      request,
      upstreamPath,
      session.auth.idToken,
    );
    if (response.status !== 401) return response;
    const refreshed = await container.sessionService.refresh(session);
    if (!refreshed) return response;
    await response.body?.cancel();
    const retried = await container.apiClient.proxy(
      retry,
      upstreamPath,
      refreshed.auth.idToken,
    );
    if (retried.status === 401) await container.sessionService.delete();
    return retried;
  } catch (error) {
    if (error instanceof AuthError && error.status === 401)
      await container.sessionService.delete();
    return errorResponse(error);
  }
}
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
