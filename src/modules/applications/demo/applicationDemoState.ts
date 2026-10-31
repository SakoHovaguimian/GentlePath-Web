import 'server-only';
import { getDemoState } from '@/services/demo/demoState';
import { gentlePathApplicationStrings as copy } from '@/strings';
import type { ServiceApplication } from '../models/serviceApplication';
import type { ApplicationFollowUp } from '../models/applicationFollowUp';

import type { DemoApplicationState } from './models/demoApplicationState';

const globalApplications = globalThis as typeof globalThis & {
  gentlePathApplicationState?: DemoApplicationState;
};

export function getDemoApplicationState(): DemoApplicationState {
  if (!globalApplications.gentlePathApplicationState) {
    const now = new Date().toISOString();
    const populatedIds = [
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222',
      '33333333-3333-4333-8333-333333333333',
    ];
    const applications = getDemoState()
      .users.filter((user) => populatedIds.includes(user.id))
      .map((user): ServiceApplication => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        child_id: null,
        title: copy.demo.applicationTitle,
        provider: copy.demo.provider,
        status: 'APPLIED',
        benefit_program_key: null,
        benefit_program_name: null,
        benefit_program_url: null,
        applied_on: new Date(Date.now() - 7 * 86400000)
          .toISOString()
          .slice(0, 10),
        notes: copy.demo.notes,
        reference: '',
        follow_ups: [],
        deleted: false,
        created_at: now,
        updated_at: now,
      }));
    const followUps = applications.flatMap((application) =>
      [-2, 0, 5].map((days, index): ApplicationFollowUp => ({
        id: crypto.randomUUID(),
        application_id: application.id,
        application_title: application.title,
        child_id: null,
        due_on: new Date(Date.now() + days * 86400000)
          .toISOString()
          .slice(0, 10),
        notes: [
          copy.demo.followUpOverdue,
          copy.demo.followUpToday,
          copy.demo.followUpUpcoming,
        ][index],
        completed_at: null,
        days_until_due: days,
        deleted: false,
        created_at: now,
        updated_at: now,
      })),
    );
    globalApplications.gentlePathApplicationState = { applications, followUps };
  }
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
