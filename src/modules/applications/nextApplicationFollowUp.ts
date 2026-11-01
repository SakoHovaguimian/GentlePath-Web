import type { ServiceApplication } from './models/serviceApplication';

export function nextApplicationFollowUp(application: ServiceApplication) {
  return application.follow_ups
    .filter((followUp) => !followUp.completed_at && !followUp.deleted)
    .sort(
      (a, b) => a.due_on.localeCompare(b.due_on) || a.id.localeCompare(b.id),
    )[0];
}
