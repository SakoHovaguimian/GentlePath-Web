import 'server-only';
import { populatedDemoUsers } from '@/services/demo/demoFixtures';
import type { DemoApplicationState } from './models/demoApplicationState';
import {
  applicationDemoTemplates,
  createDemoApplicationFixture,
} from './applicationDemoFixtures';
import {
  applicationFixtureVersion,
  upgradeDemoApplicationFixtures,
} from './upgradeDemoApplicationFixtures';

const globalApplications = globalThis as typeof globalThis & {
  gentlePathApplicationState?: DemoApplicationState;
};

export function getDemoApplicationState(): DemoApplicationState {
  if (!globalApplications.gentlePathApplicationState) {
    const fixtures = populatedDemoUsers.flatMap((user) =>
      applicationDemoTemplates.map((_, index) =>
        createDemoApplicationFixture(user.id, index),
      ),
    );
    globalApplications.gentlePathApplicationState = {
      applications: fixtures.map((fixture) => fixture.application),
      followUps: fixtures.map((fixture) => fixture.followUp),
      fixtureVersion: applicationFixtureVersion,
    };
  }
  upgradeDemoApplicationFixtures(globalApplications.gentlePathApplicationState);
  return globalApplications.gentlePathApplicationState;
}

export function resetDemoApplicationState() {
  globalApplications.gentlePathApplicationState = undefined;
}

export function resetDemoApplicationUser(userId: string) {
  const state = getDemoApplicationState();
  const applicationIds = new Set(
    state.applications
      .filter((application) => application.user_id === userId)
      .map((application) => application.id),
  );
  state.applications = state.applications.filter(
    (application) => application.user_id !== userId,
  );
  state.followUps = state.followUps.filter(
    (followUp) => !applicationIds.has(followUp.application_id),
  );
}
