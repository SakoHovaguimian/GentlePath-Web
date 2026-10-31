import { resetDemoGoalUser } from '@/modules/goals/demo/goalDemoState';
import { resetDemoApplicationUser } from '@/modules/applications/demo/applicationDemoState';
import { OwnershipError } from '@/errors/domainErrors';
import { errorResponse } from '@/services/api/routeSafety';
import { requireDeveloperAccess } from '@/services/demo/demoDevAccess';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import { restartDemoOnboardingUser } from '@/modules/onboarding/demo/onboardingState';

export async function POST(request: Request) {
  try {
    const { session } = await requireDeveloperAccess(request, true);
    const current = getDemoState().users.find(
      (user) =>
        user.id === session.user.id &&
        user.external_id === session.auth.externalId &&
        !user.disabled &&
        !user.deleted,
    );
    if (!current || current.email !== copy.onboardingDemoEmail)
      throw new OwnershipError();
    const state = getDemoPortalState();
    state.children = state.children.filter(
      (child) => child.userId !== current.id,
    );
    state.journals = state.journals.filter(
      (entry) => entry.userId !== current.id,
    );
    state.observations = state.observations.filter(
      (observation) => observation.userId !== current.id,
    );
    state.favorites.delete(current.id);
    resetDemoApplicationUser(current.id);
    resetDemoGoalUser(current.id);
    restartDemoOnboardingUser(current.id);
    return Response.json(
      { restarted: true },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
