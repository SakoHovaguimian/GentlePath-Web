import 'server-only';
import { populatedDemoUsers } from '@/services/demo/demoFixtures';
import { gentlePathApplicationStrings as copy } from '@/strings';
import type { ServiceApplication } from '../models/serviceApplication';
import type { ApplicationFollowUp } from '../models/applicationFollowUp';
import { demoApplicationDate } from './applicationCalendarDay';

export const applicationDemoTemplates = [
  {
    title: copy.demo.applicationTitle,
    provider: copy.demo.provider,
    status: 'APPLIED',
    days: -3,
    followUp: copy.demo.followUpOverdue,
  },
  {
    title: copy.demo.speechTitle,
    provider: copy.demo.speechProvider,
    status: 'WAITLISTED',
    days: -1,
    followUp: copy.demo.speechFollowUp,
  },
  {
    title: copy.demo.schoolTitle,
    provider: copy.demo.schoolProvider,
    status: 'APPLIED',
    days: 0,
    followUp: copy.demo.schoolFollowUp,
  },
  {
    title: copy.demo.respiteTitle,
    provider: copy.demo.respiteProvider,
    status: 'WAITLISTED',
    days: 5,
    followUp: copy.demo.respiteFollowUp,
  },
  {
    title: copy.demo.transportTitle,
    provider: copy.demo.transportProvider,
    status: 'APPROVED',
    days: 7,
    followUp: copy.demo.transportFollowUp,
  },
] as const;

export function createDemoApplicationFixture(userId: string, index: number) {
  const template = applicationDemoTemplates[index];
  const userIndex = populatedDemoUsers.findIndex((user) => user.id === userId);
  const suffix = String(index + 1).padStart(12, '0');
  const now = new Date().toISOString();
  const application: ServiceApplication = {
    id: `a100000${userIndex}-0000-4000-8000-${suffix}`,
    user_id: userId,
    child_id: null,
    title: template.title,
    provider: template.provider,
    status: template.status,
    benefit_program_key: null,
    benefit_program_name: null,
    benefit_program_url: null,
    applied_on: demoApplicationDate(userId, -14 - index * 2),
    notes: copy.demo.notes,
    reference: '',
    follow_ups: [],
    deleted: false,
    created_at: now,
    updated_at: now,
  };
  const followUp: ApplicationFollowUp = {
    id: `a200000${userIndex}-0000-4000-8000-${suffix}`,
    application_id: application.id,
    application_title: application.title,
    child_id: null,
    due_on: demoApplicationDate(userId, template.days),
    notes: template.followUp,
    completed_at: null,
    days_until_due: template.days,
    deleted: false,
    created_at: now,
    updated_at: now,
  };
  return { application, followUp };
}
