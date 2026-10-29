import 'server-only';
import type { UserRole } from '@/models/userRole';
import type { ServerSession } from '@/services/session/models/serverSession';
import { AuthError } from '@/errors/domainErrors';
import { gentlePathDemoStrings as copy } from '@/strings';
import { getDemoState } from './demoState';
import { DemoFirebaseAuthService } from './demoFirebaseAuthService';

export async function createDemoIdentitySession(
  role: UserRole,
): Promise<ServerSession> {
  const user = getDemoState().users.find(
    (user) =>
      user.role === role &&
      user.email === copy.accounts[role].email &&
      !user.disabled &&
      !user.deleted,
  );
  if (!user) throw new AuthError(copy.accountUnavailable, 409);
  const auth = await new DemoFirebaseAuthService().signIn(
    user.email,
    copy.seedPassword,
  );
  return {
    auth,
    demo: true,
    user: {
      id: user.id,
      externalId: user.external_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role,
    },
  };
}
