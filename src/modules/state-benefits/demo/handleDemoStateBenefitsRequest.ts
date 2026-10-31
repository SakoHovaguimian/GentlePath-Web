import 'server-only';
import { AuthError, NotFoundError } from '@/errors/domainErrors';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoOnboardingSettings } from '@/modules/onboarding/demo/onboardingState';
import { getDemoStateBenefitPrograms } from './stateBenefitPrograms';

export async function handleDemoStateBenefitsRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const pathname = new URL(path, 'http://gentlepath.internal').pathname;
  if (
    pathname !== '/portal/state-benefits' &&
    !pathname.startsWith('/portal/state-benefits/')
  )
    return null;
  const current = getDemoState().users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.deleted &&
      !user.disabled,
  );
  if (!session.demo || !current) throw new AuthError();
  if (request.method !== 'GET') throw new NotFoundError();
  const stateCode = getDemoOnboardingSettings(current.id).state_code;
  const programs = stateCode ? getDemoStateBenefitPrograms(stateCode) : [];
  const id = pathname.slice('/portal/state-benefits'.length + 1);
  const json = (data: unknown) =>
    Response.json(data, { headers: { 'cache-control': 'no-store' } });
  if (!id) return json(context.scenario === 'empty' ? [] : programs);
  const program = programs.find((item) => item.id === decodeURIComponent(id));
  if (!program) throw new NotFoundError();
  return json(program);
}
