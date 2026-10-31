import 'server-only';
import {
  AuthError,
  DomainError,
  NotFoundError,
  ValidationError,
} from '@/errors/domainErrors';
import type { ServerSession } from '@/services/session/models/serverSession';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import { OnboardingUpdateSchema } from '../models/onboardingUpdate';
import { ProfilePreferencesUpdateSchema } from '../models/profilePreferencesUpdate';
import {
  getDemoOnboardingSettings,
  saveDemoOnboardingSettings,
} from './onboardingState';

export async function handleDemoOnboardingRequest(
  request: Request,
  path: string,
  session: ServerSession,
): Promise<Response | null> {
  const pathname = new URL(path, 'http://gentlepath.internal').pathname;
  if (
    pathname !== '/portal/onboarding' &&
    pathname !== '/portal/family-preferences'
  )
    return null;
  const user = getDemoState().users.find(
    (item) =>
      item.id === session.user.id &&
      item.external_id === session.auth.externalId &&
      !item.deleted &&
      !item.disabled,
  );
  if (!session.demo || !user) throw new AuthError();
  const current = getDemoOnboardingSettings(user.id);
  const json = (data: unknown) =>
    Response.json(data, { headers: { 'cache-control': 'no-store' } });
  if (request.method === 'GET' && pathname === '/portal/onboarding')
    return json(current);
  if (request.method !== 'PUT') throw new NotFoundError();
  const body = await request.json().catch(() => {
    throw new ValidationError();
  });
  if (pathname === '/portal/family-preferences') {
    const parsed = ProfilePreferencesUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError(copy.invalidSelection);
    return json(
      saveDemoOnboardingSettings({
        ...current,
        state_code: parsed.data.state_code,
        discovery_approaches: parsed.data.discovery.approaches,
        discovery_preferences_answered: true,
      }),
    );
  }
  const parsed = OnboardingUpdateSchema.safeParse(body);
  if (!parsed.success) throw new ValidationError(copy.invalidSelection);
  const input = parsed.data;
  if (input.step === 'FINISH' && current.onboarding_completed_at)
    return json(current);
  const order = ['STATE', 'CHILDREN', 'DISCOVERY', 'FINISH', 'COMPLETE'];
  if (order.indexOf(input.step) > order.indexOf(current.onboarding_step))
    throw new DomainError(copy.previousStep, 'ONBOARDING_CONFLICT', 409);
  const next = { ...current };
  const hasChildren = () =>
    getDemoPortalState().children.some((child) => child.userId === user.id);
  if (input.step === 'STATE') {
    next.state_code = input.state_code;
    if (current.onboarding_step === 'STATE') next.onboarding_step = 'CHILDREN';
  } else if (input.step === 'CHILDREN') {
    if (input.response === 'ADDED' && !hasChildren())
      throw new DomainError(copy.childrenRequired, 'ONBOARDING_CONFLICT', 409);
    next.onboarding_children_response = input.response;
    if (current.onboarding_step === 'CHILDREN')
      next.onboarding_step = 'DISCOVERY';
  } else if (input.step === 'DISCOVERY') {
    next.discovery_approaches = input.discovery.approaches;
    next.discovery_preferences_answered = true;
    if (current.onboarding_step === 'DISCOVERY')
      next.onboarding_step = 'FINISH';
  } else {
    if (
      !current.state_code ||
      !current.onboarding_children_response ||
      !current.discovery_preferences_answered
    )
      throw new DomainError(copy.incomplete, 'ONBOARDING_CONFLICT', 409);
    if (current.onboarding_children_response === 'ADDED' && !hasChildren())
      throw new DomainError(copy.childrenRequired, 'ONBOARDING_CONFLICT', 409);
    next.onboarding_step = 'COMPLETE';
    next.onboarding_completed_at = new Date().toISOString();
  }
  return json(saveDemoOnboardingSettings(next));
}
