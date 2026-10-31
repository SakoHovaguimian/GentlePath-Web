import 'server-only';
import { z } from 'zod';
import {
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
  DomainError,
} from '@/errors/domainErrors';
import type { DemoContext } from '@/models/demoContext';
import type { ServerSession } from '@/services/session/models/serverSession';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { getDemoNotificationInboxState } from '@/modules/notification-inbox/demo/notificationInboxState';
import { gentlePathApplicationStrings as copy } from '@/strings';
import {
  ServiceApplicationCreateSchema,
  ServiceApplicationUpdateSchema,
  type ServiceApplication,
  type ServiceApplicationCreate,
} from '../models/serviceApplication';
import {
  ApplicationFollowUpCreateSchema,
  ApplicationFollowUpUpdateSchema,
  ApplicationFollowUpCompletionSchema,
  type ApplicationFollowUp,
} from '../models/applicationFollowUp';
import { ApplicationPriorityQuerySchema } from '../models/applicationPriorityQuery';
import { ApplicationQuerySchema } from '../models/applicationQuery';
import { getDemoApplicationState } from './applicationDemoState';
import { getDemoStateBenefitProgramById } from '@/modules/state-benefits/demo/stateBenefitPrograms';

const numericYear = 'numeric';
const successMessage = 'success!';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });

export async function handleApplicationRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, id, section, followUpId, action, ...extra] =
    url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (area !== 'portal' || feature !== 'applications') return null;
  if (extra.length) throw new NotFoundError();
  const current = getDemoState().users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.deleted &&
      !user.disabled,
  );
  if (!session.demo || !current) throw new AuthError();
  const state = getDemoApplicationState();
  const children = getDemoPortalState().children.filter(
    (child) => child.userId === current.id,
  );
  const requireChild = (childId: string | null | undefined) => {
    if (childId && !children.some((child) => child.id === childId))
      throw new OwnershipError(copy.validation.invalidChild);
  };
  const own = state.applications.filter(
    (application) =>
      !application.deleted &&
      application.user_id === current.id &&
      (!application.child_id ||
        children.some((child) => child.id === application.child_id)),
  );
  const timezone =
    getDemoNotificationInboxState().settings.get(current.id)
      ?.effectiveTimezone ?? 'UTC';
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: numericYear,
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (type: string) =>
    parts.find((part) => part.type === type)!.value;
  const today = Date.UTC(
    Number(value('year')),
    Number(value('month')) - 1,
    Number(value('day')),
  );
  const detailedFollowUp = (
    followUp: ApplicationFollowUp,
  ): ApplicationFollowUp => {
    const application = own.find(
      (item) => item.id === followUp.application_id,
    )!;
    return {
      ...followUp,
      application_title: application.title,
      child_id: application.child_id,
      days_until_due: Math.round(
        (Date.parse(`${followUp.due_on}T00:00:00.000Z`) - today) / 86400000,
      ),
    };
  };
  const detailed = (application: ServiceApplication): ServiceApplication => ({
    ...application,
    follow_ups: state.followUps
      .filter((item) => item.application_id === application.id && !item.deleted)
      .sort(
        (a, b) => a.due_on.localeCompare(b.due_on) || a.id.localeCompare(b.id),
      )
      .map(detailedFollowUp),
  });
  const input = () =>
    request.json().catch(() => {
      throw new ValidationError();
    });
  const snapshot = <T extends ServiceApplicationCreate>(fields: T): T => {
    if (!fields.benefit_program_key)
      return {
        ...fields,
        benefit_program_name: null,
        benefit_program_url: null,
      };
    const program = getDemoStateBenefitProgramById(fields.benefit_program_key);
    if (!program) throw new ValidationError(copy.validation.program);
    return {
      ...fields,
      benefit_program_name: program.name,
      benefit_program_url: program.program_url,
    };
  };
  const page = <T>(records: T[], limit: number, offset: number) => {
    const matches = context.scenario === 'empty' ? [] : records;
    const data = matches.slice(offset, offset + limit);
    const hasMore = offset + data.length < matches.length;
    return json({
      data,
      page: {
        limit,
        offset,
        hasMore,
        nextOffset: hasMore ? offset + limit : null,
      },
    });
  };
  const conflict = (expected: string, actual: string | null) => {
    if (expected !== actual)
      throw new DomainError(copy.validation.conflict, 'CONFLICT', 409);
  };
  const nextUpdated = (previous: string | null) =>
    new Date(
      Math.max(Date.now(), Date.parse(previous ?? '') + 1 || 0),
    ).toISOString();
  const method = request.method;
  if (id === 'priority-follow-ups' && !section && method === 'GET') {
    const query = ApplicationPriorityQuerySchema.parse(
      Object.fromEntries(url.searchParams),
    );
    const allPending = state.followUps
      .filter(
        (item) =>
          !item.deleted &&
          !item.completed_at &&
          own.some((application) => application.id === item.application_id),
      )
      .sort(
        (a, b) => a.due_on.localeCompare(b.due_on) || a.id.localeCompare(b.id),
      );
    return page(allPending.map(detailedFollowUp), query.limit, query.offset);
  }
  if (!id && method === 'GET') {
    const personal = url.searchParams.get('personal_only');
    if (personal !== null && !['true', 'false'].includes(personal))
      throw new ValidationError();
    const query = ApplicationQuerySchema.parse({
      ...Object.fromEntries(url.searchParams),
      personal_only: personal === 'true',
    });
    requireChild(query.child_id);
    const matches = own
      .filter(
        (item) =>
          (!query.child_id || item.child_id === query.child_id) &&
          (!query.personal_only || !item.child_id) &&
          (!query.status || item.status === query.status) &&
          item.title
            .toLocaleLowerCase('en-US')
            .includes(query.query.toLocaleLowerCase('en-US')),
      )
      .sort(
        (a, b) =>
          (b.updated_at ?? '').localeCompare(a.updated_at ?? '') ||
          b.id.localeCompare(a.id),
      );
    return page(matches.map(detailed), query.limit, query.offset);
  }
  if (!id && method === 'POST') {
    const fields = snapshot(
      ServiceApplicationCreateSchema.parse(await input()),
    );
    requireChild(fields.child_id);
    const now = new Date().toISOString();
    const application: ServiceApplication = {
      ...fields,
      id: crypto.randomUUID(),
      user_id: current.id,
      deleted: false,
      created_at: now,
      updated_at: now,
      follow_ups: [],
    };
    state.applications.push(application);
    return json(application, 201);
  }
  if (!id) throw new NotFoundError();
  z.string().uuid().parse(id);
  const application = own.find((item) => item.id === id);
  if (!application) throw new NotFoundError(copy.validation.unavailable);
  if (!section && method === 'GET') return json(detailed(application));
  if (!section && method === 'PUT') {
    const value = ServiceApplicationUpdateSchema.parse(await input());
    const fields =
      value.benefit_program_key === application.benefit_program_key
        ? {
            ...value,
            benefit_program_name: application.benefit_program_name,
            benefit_program_url: application.benefit_program_url,
          }
        : snapshot(value);
    requireChild(fields.child_id);
    conflict(fields.expected_updated_at, application.updated_at);
    const updates = ServiceApplicationCreateSchema.parse(fields);
    Object.assign(application, updates, {
      updated_at: nextUpdated(application.updated_at),
    });
    return json(detailed(application));
  }
  if (!section && method === 'DELETE') {
    application.deleted = true;
    return json({ message: successMessage });
  }
  if (section !== 'follow-ups') throw new NotFoundError();
  if (!followUpId && !action && method === 'POST') {
    const fields = ApplicationFollowUpCreateSchema.parse(await input());
    const now = new Date().toISOString();
    const followUp: ApplicationFollowUp = {
      ...fields,
      id: crypto.randomUUID(),
      application_id: id,
      application_title: application.title,
      child_id: application.child_id,
      completed_at: null,
      deleted: false,
      created_at: now,
      updated_at: now,
      days_until_due: null,
    };
    state.followUps.push(followUp);
    return json(detailedFollowUp(followUp), 201);
  }
  const followUp = state.followUps.find(
    (item) =>
      item.id === followUpId && item.application_id === id && !item.deleted,
  );
  if (!followUp) throw new NotFoundError();
  if (action === 'completion' && method === 'PUT') {
    const fields = ApplicationFollowUpCompletionSchema.parse(await input());
    conflict(fields.expected_updated_at, followUp.updated_at);
    followUp.completed_at = fields.completed ? new Date().toISOString() : null;
  } else if (!action && method === 'PUT') {
    const fields = ApplicationFollowUpUpdateSchema.parse(await input());
    conflict(fields.expected_updated_at, followUp.updated_at);
    followUp.due_on = fields.due_on;
    followUp.notes = fields.notes;
  } else if (!action && method === 'DELETE') {
    followUp.deleted = true;
    return json({ message: successMessage });
  } else throw new NotFoundError();
  followUp.updated_at = nextUpdated(followUp.updated_at);
  return json(detailedFollowUp(followUp));
}
