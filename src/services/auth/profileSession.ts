import 'server-only';
import { getContainer } from '@/container';
import { getEffectiveRuntime } from '@/services/demo/demoRuntime';
import { getDemoState } from '@/services/demo/demoState';
import { mapUserTransportToDomain } from '@/services/api/domainMappers';
import type { UserTransport } from '@/services/api/models';
import type { FirebaseAuthSession } from './models/firebaseAuthSession';
import type { SessionUser } from '@/models/sessionUser';
import { AuthError } from '@/errors/domainErrors';
export async function getProfileSession(
  auth: FirebaseAuthSession,
): Promise<SessionUser> {
  const runtime = await getEffectiveRuntime();
  const container = await getContainer();
  const transport = runtime.demoMode
    ? getDemoState().users.find((user) => user.external_id === auth.externalId)
    : await container.apiClient.request<UserTransport>(
        '/users/profile',
        auth.idToken,
      );
  if (!transport || transport.deleted || transport.disabled)
    throw new AuthError();
  const user = mapUserTransportToDomain(transport);
  return {
    id: user.id,
    externalId: user.externalId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}
