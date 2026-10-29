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
import { featureBackendProxy } from '@/services/api/featureBackendProxy';
import type { BackendForward } from '@/services/api/models/backendForward';
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
    const finalize = async (response: Response) => {
      if (
        response.ok &&
        request.method === 'DELETE' &&
        path.length === 3 &&
        path[0] === 'portal' &&
        path[1] === 'account-tools' &&
        path[2] === 'account'
      ) {
        await container.sessionService.delete();
      }
      return response;
    };
    if (container.demoMode)
      return await finalize(
        await container.demoApiClient.proxy(
          request,
          upstreamPath,
          session,
          await getDemoContext(),
        ),
      );
    let activeSession = session;
    const forward: BackendForward = async (source, path) => {
      const retry = source.clone();
      const response = await container.apiClient.proxy(
        source,
        path,
        activeSession.auth.idToken,
      );
      if (response.status !== 401) return response;
      const refreshed = await container.sessionService.refresh(activeSession);
      if (!refreshed) return response;
      activeSession = refreshed;
      await response.body?.cancel();
      const retried = await container.apiClient.proxy(
        retry,
        path,
        refreshed.auth.idToken,
      );
      if (retried.status === 401) await container.sessionService.delete();
      return retried;
    };
    const feature = await featureBackendProxy(
      request,
      upstreamPath,
      forward,
      session.user.id,
      session.user.role,
    );
    if (feature) return await finalize(feature);
    return await finalize(await forward(request, upstreamPath));
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
