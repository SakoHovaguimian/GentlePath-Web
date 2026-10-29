import 'server-only';
import { getContainer } from '@/container';
import {
  AuthError,
  NotFoundError,
  OwnershipError,
} from '@/errors/domainErrors';
import { trustedMutation } from '@/services/api/routeSafety';
import { getEffectiveRuntime, isDevSettingsAvailable } from './demoRuntime';
import { gentlePathDemoStrings as copy } from '@/strings';

export async function requireDeveloperAccess(
  request?: Request,
  demoRequired = false,
) {
  if (!isDevSettingsAvailable()) throw new NotFoundError(copy.unavailable);
  if (request && !trustedMutation(request)) throw new OwnershipError();
  const runtime = await getEffectiveRuntime();
  const container = await getContainer();
  const session = await container.sessionService.valid();
  if (!session) throw new AuthError();
  if (demoRequired && (!runtime.demoMode || !session.demo))
    throw new OwnershipError(copy.demoRequired);
  return { runtime, container, session };
}
