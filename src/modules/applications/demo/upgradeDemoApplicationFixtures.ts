import 'server-only';
import { populatedDemoUsers } from '@/services/demo/demoFixtures';
import { gentlePathApplicationStrings as copy } from '@/strings';
import type { DemoApplicationState } from './models/demoApplicationState';
import {
  applicationDemoTemplates,
  createDemoApplicationFixture,
} from './applicationDemoFixtures';

export const applicationFixtureVersion = 2;

/** Upgrade only retained populated-account fixtures; never reset account data. */
export function upgradeDemoApplicationFixtures(state: DemoApplicationState) {
  if ((state.fixtureVersion ?? 0) >= applicationFixtureVersion) return;
  const legacyNotes: readonly string[] = [
    copy.demo.followUpOverdue,
    copy.demo.followUpToday,
    copy.demo.followUpUpcoming,
  ];
  for (const user of populatedDemoUsers) {
    const original = state.applications.find(
      (application) =>
        application.user_id === user.id &&
        state.followUps.some(
          (followUp) =>
            followUp.application_id === application.id &&
            followUp.application_title === copy.demo.applicationTitle &&
            followUp.created_at === application.created_at &&
            legacyNotes.includes(followUp.notes),
        ),
    );
    // An absent/deleted original may reflect an explicit account reset/removal.
    if (!original || original.deleted) continue;
    const originalFollowUps = state.followUps.filter(
      (followUp) => followUp.application_id === original.id,
    );
    const untouched =
      original.updated_at === original.created_at &&
      original.title === copy.demo.applicationTitle &&
      original.provider === copy.demo.provider &&
      original.status === 'APPLIED' &&
      original.notes === copy.demo.notes &&
      !original.child_id &&
      !original.reference &&
      originalFollowUps.length === 3 &&
      originalFollowUps.every(
        (followUp) =>
          !followUp.deleted &&
          !followUp.completed_at &&
          followUp.updated_at === followUp.created_at &&
          legacyNotes.includes(followUp.notes),
      );
    if (untouched) {
      const originalDue = originalFollowUps.find(
        (followUp) => followUp.notes === copy.demo.followUpOverdue,
      )!;
      const { followUp } = createDemoApplicationFixture(user.id, 0);
      state.followUps = state.followUps.filter(
        (item) => item.application_id !== original.id,
      );
      state.followUps.push({
        ...followUp,
        id: originalDue.id,
        application_id: original.id,
        created_at: originalDue.created_at,
        updated_at: originalDue.updated_at,
      });
    }
    for (let index = 1; index < applicationDemoTemplates.length; index++) {
      const { application, followUp } = createDemoApplicationFixture(
        user.id,
        index,
      );
      // Retain even deleted records with a known fixture ID.
      if (state.applications.some((item) => item.id === application.id))
        continue;
      state.applications.push(application);
      state.followUps.push(followUp);
    }
  }
  state.fixtureVersion = applicationFixtureVersion;
}
