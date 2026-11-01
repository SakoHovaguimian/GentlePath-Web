import 'server-only';
import {
  newDemoUserId,
  populatedDemoUsers,
} from '@/services/demo/demoFixtures';
import { getDemoState } from '@/services/demo/demoState';
import type { FamilyPreferences } from '../models/familyPreferences';

const globalState = globalThis as typeof globalThis & {
  gentlePathOnboarding?: Map<string, FamilyPreferences>;
};
function store() {
  return (globalState.gentlePathOnboarding ??= new Map());
}
export function initializeDemoOnboarding(
  userId: string,
  completed = false,
): FamilyPreferences {
  const settings: FamilyPreferences = {
    user_id: userId,
    state_code: completed ? 'CA' : null,
    discovery_approaches: [],
    discovery_preferences_answered: completed,
    onboarding_step: completed ? 'COMPLETE' : 'STATE',
    onboarding_children_response: completed
      ? userId === newDemoUserId
        ? 'LATER'
        : 'ADDED'
      : null,
    onboarding_completed_at: completed ? new Date().toISOString() : null,
  };
  store().set(userId, settings);
  return settings;
}
export function getDemoOnboardingSettings(userId: string): FamilyPreferences {
  const current = store().get(userId);
  if (current) return current;
  const user = getDemoState().users.find((item) => item.id === userId);
  return initializeDemoOnboarding(
    userId,
    Boolean(
      user &&
      (user.id === newDemoUserId ||
        populatedDemoUsers.some((seed) => seed.id === user.id)),
    ),
  );
}
export function saveDemoOnboardingSettings(settings: FamilyPreferences) {
  store().set(settings.user_id, settings);
  return settings;
}
export function resetDemoOnboardingState() {
  globalState.gentlePathOnboarding = undefined;
}
export function restartDemoOnboardingUser(userId: string) {
  return initializeDemoOnboarding(userId, false);
}
