import 'server-only';
import { getDemoSavedCount } from '@/modules/engagement/demo/engagementState';
import { getDemoMilestoneObservationDates } from '@/modules/milestone-admin/server/demoMilestoneAdminState';
import { z } from 'zod';
import {
  AuthError,
  ApiError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import {
  ChildProfileInputSchema,
  ChildProfileUpdateSchema,
} from '@/modules/portal/models/childProfile';
import { JournalInputSchema } from '@/modules/portal/models/journalEntry';
import { ObservationInputSchema } from '@/modules/portal/models/milestone';
import {
  ManagedUserInputSchema,
  type ManagedUser,
} from '@/modules/portal/models/managedUser';
import { ReportResolutionSchema } from '@/modules/portal/models/moderationReport';
import { PlatformSettingsSchema } from '@/modules/portal/models/platformSettings';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { gentlePathDemoStrings as copy } from '@/strings';
import { getDemoState } from './demoState';
import { getDemoPortalState } from './demoPortalState';
import { getDemoBlogState } from './demoBlogState';

const SavedInputSchema = z.object({ saved: z.boolean() }).strict();
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const noContent = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
const input = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });

export async function handleDemoPortalRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response> {
  const accounts = getDemoState();
  const current = accounts.users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.disabled &&
      !user.deleted,
  );
  if (!current || !session.demo) throw new AuthError();
  const role = current.role ?? 'user';
  const state = getDemoPortalState();
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, resource, id, action] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  const method = request.method;
  const empty = context.scenario === 'empty';
  const ownChildren = state.children.filter(
    (child) => child.userId === current.id,
  );
  const ownJournals = state.journals.filter(
    (entry) =>
      entry.userId === current.id &&
      (!entry.childId ||
        ownChildren.some((child) => child.id === entry.childId)),
  );
  const requireOwnChild = (childId: string) => {
    const child = ownChildren.find((child) => child.id === childId);
    if (!child) throw new OwnershipError(copy.invalidChild);
    return child;
  };
  const validateChildDate = (date: string) => {
    if (
      new Date(date).toISOString().slice(0, 10) !== date ||
      date > new Date().toISOString().slice(0, 10)
    )
      throw new ValidationError(copy.invalidDate);
  };
  const favorites = state.favorites.get(current.id) ?? new Set<string>();
  const withSaved = (item: (typeof state.resources)[number]) => ({
    ...item,
    saved: favorites.has(item.id),
  });

  if (area === 'portal') {
    if (state.settings.maintenanceMode && role === 'user')
      throw new ApiError(copy.maintenanceActive, 503);
    if (resource === 'overview' && method === 'GET' && !id) {
      const observationDates = getDemoMilestoneObservationDates(current.id);
      const weeklyActivity = Array.from({ length: 7 }, (_, index) => {
        const day = new Date(Date.now() - (6 - index) * 86400000)
          .toISOString()
          .slice(0, 10);
        return (
          ownJournals.filter((entry) => entry.createdAt?.startsWith(day))
            .length +
          observationDates.filter((observedAt) => observedAt.startsWith(day))
            .length
        );
      });
      return json({
        journalCount: empty ? 0 : ownJournals.length,
        childCount: empty ? 0 : ownChildren.length,
        savedCount: empty ? 0 : getDemoSavedCount(current.id),
        observationCount: empty ? 0 : observationDates.length,
        weeklyActivity: empty ? Array(7).fill(0) : weeklyActivity,
      });
    }
    if (resource === 'children' && !action) {
      if (method === 'GET' && !id) return json(empty ? [] : ownChildren);
      if (method === 'POST' && !id) {
        const body = ChildProfileInputSchema.parse(await input(request));
        validateChildDate(body.dateOfBirth);
        const child = { ...body, id: crypto.randomUUID(), userId: current.id };
        state.children.push(child);
        return json(child, 201);
      }
      const child = ownChildren.find((child) => child.id === id);
      if (!child) throw new NotFoundError();
      if (method === 'GET') return json(child);
      if (method === 'PATCH') {
        const body = ChildProfileUpdateSchema.parse(await input(request));
        validateChildDate(body.dateOfBirth);
        Object.assign(child, body);
        return json(child);
      }
      if (method === 'DELETE') {
        state.children = state.children.filter((item) => item.id !== child.id);
        return noContent();
      }
    }
    if (resource === 'journals' && !action) {
      if (method === 'GET' && !id)
        return json(
          empty
            ? []
            : [...ownJournals].sort((a, b) =>
                (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
              ),
        );
      if (method === 'POST' && !id) {
        const body = JournalInputSchema.parse(await input(request));
        if (body.childId) requireOwnChild(body.childId);
        const now = new Date().toISOString();
        const entry = {
          ...body,
          id: crypto.randomUUID(),
          userId: current.id,
          createdAt: now,
          updatedAt: now,
        };
        state.journals.unshift(entry);
        return json(entry, 201);
      }
      const entry = ownJournals.find((entry) => entry.id === id);
      if (!entry) throw new NotFoundError();
      if (method === 'GET') return json(entry);
      if (method === 'PATCH') {
        const body = JournalInputSchema.parse(await input(request));
        if (body.childId) requireOwnChild(body.childId);
        Object.assign(entry, body, { updatedAt: new Date().toISOString() });
        return json(entry);
      }
      if (method === 'DELETE') {
        state.journals = state.journals.filter((item) => item.id !== entry.id);
        return noContent();
      }
    }
    if (resource === 'resources') {
      if (method === 'GET' && !id) {
        const search = (url.searchParams.get('search') ?? '')
          .trim()
          .toLowerCase();
        const category = url.searchParams.get('category');
        return json(
          empty
            ? []
            : state.resources
                .filter(
                  (item) =>
                    (!category || item.category === category) &&
                    [item.title, item.description].some((value) =>
                      value.toLowerCase().includes(search),
                    ),
                )
                .map(withSaved),
        );
      }
      const item = state.resources.find((item) => item.id === id);
      if (!item) throw new NotFoundError();
      if (method === 'GET' && !action) return json(withSaved(item));
      if (method === 'POST' && action === 'favorite') {
        const { saved } = SavedInputSchema.parse(await input(request));
        if (saved) favorites.add(item.id);
        else favorites.delete(item.id);
        state.favorites.set(current.id, favorites);
        return json(withSaved(item));
      }
    }
    if (resource === 'milestones' && !action) {
      const requestedChildId = url.searchParams.get('childId');
      const childId = requestedChildId
        ? requireOwnChild(requestedChildId).id
        : ownChildren[0]?.id;
      const withObservation = (
        milestone: (typeof state.milestones)[number],
        selectedChildId = childId,
      ) => {
        const observation = state.observations.find(
          (item) =>
            item.userId === current.id &&
            item.childId === selectedChildId &&
            item.milestoneId === milestone.id,
        );
        return {
          ...milestone,
          response: observation?.response ?? null,
          observedAt: observation?.observedAt ?? null,
        };
      };
      if (method === 'GET' && !id)
        return json(
          empty
            ? []
            : state.milestones.map((milestone) => withObservation(milestone)),
        );
      const milestone = state.milestones.find(
        (milestone) => milestone.id === id,
      );
      if (!milestone) throw new NotFoundError();
      if (method === 'PATCH') {
        const body = ObservationInputSchema.parse(await input(request));
        requireOwnChild(body.childId);
        const observation = {
          ...body,
          userId: current.id,
          milestoneId: milestone.id,
          observedAt: new Date().toISOString(),
        };
        state.observations = state.observations.filter(
          (item) =>
            !(
              item.userId === current.id &&
              item.childId === body.childId &&
              item.milestoneId === milestone.id
            ),
        );
        state.observations.push(observation);
        return json(withObservation(milestone, body.childId));
      }
    }
  }

  if (area === 'admin') {
    if (role !== 'admin' && role !== 'superadmin') throw new OwnershipError();
    if (resource === 'overview' && method === 'GET' && !id) {
      const users = accounts.users.filter((user) => !user.deleted);
      const posts = getDemoBlogState();
      const weeklyRegistrations = Array.from({ length: 7 }, (_, index) => {
        const day = new Date(Date.now() - (6 - index) * 86400000)
          .toISOString()
          .slice(0, 10);
        return users.filter((user) => user.created_at.startsWith(day)).length;
      });
      return json({
        userCount: empty ? 0 : users.length,
        activeUserCount: empty
          ? 0
          : users.filter((user) => !user.disabled).length,
        publishedBlogCount: empty
          ? 0
          : posts.filter((post) => post.status === 'published').length,
        draftBlogCount: empty
          ? 0
          : posts.filter((post) => post.status === 'draft').length,
        openReportCount: empty
          ? 0
          : state.reports.filter((report) => report.status === 'open').length,
        resourceCount: empty ? 0 : state.resources.length,
        roleCounts: {
          user: empty
            ? 0
            : users.filter((user) => (user.role ?? 'user') === 'user').length,
          admin: empty
            ? 0
            : users.filter((user) => user.role === 'admin').length,
          superadmin: empty
            ? 0
            : users.filter((user) => user.role === 'superadmin').length,
        },
        weeklyRegistrations: empty ? Array(7).fill(0) : weeklyRegistrations,
      });
    }
    if (resource === 'users' && !action) {
      const managed = (user: typeof current): ManagedUser => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role ?? 'user',
        createdAt: user.created_at,
        disabled: user.disabled ?? false,
      });
      if (method === 'GET' && !id)
        return json(
          empty
            ? []
            : accounts.users.filter((user) => !user.deleted).map(managed),
        );
      if (method === 'PATCH' && id) {
        if (role !== 'superadmin')
          throw new OwnershipError(copy.superadminRequired);
        const user = accounts.users.find(
          (user) => user.id === id && !user.deleted,
        );
        if (!user) throw new NotFoundError();
        const body = ManagedUserInputSchema.parse(await input(request));
        const removingAccess =
          body.disabled === true ||
          (body.role !== undefined && body.role !== 'superadmin');
        const isLastSuperadmin =
          user.role === 'superadmin' &&
          !user.disabled &&
          accounts.users.filter(
            (item) =>
              item.role === 'superadmin' && !item.disabled && !item.deleted,
          ).length <= 1;
        if (removingAccess && (user.id === current.id || isLastSuperadmin))
          throw new OwnershipError(copy.protectedSuperadmin);
        Object.assign(user, body, { updated_at: new Date().toISOString() });
        return json(managed(user));
      }
    }
    if (resource === 'reports' && !action) {
      if (method === 'GET' && !id) return json(empty ? [] : state.reports);
      if (method === 'PATCH' && id) {
        const report = state.reports.find((item) => item.id === id);
        if (!report) throw new NotFoundError();
        Object.assign(
          report,
          ReportResolutionSchema.parse(await input(request)),
          { reviewerId: current.id, reviewedAt: new Date().toISOString() },
        );
        return json(report);
      }
    }
    if (resource === 'settings' && !id) {
      if (role !== 'superadmin')
        throw new OwnershipError(copy.superadminRequired);
      if (method === 'GET') return json(state.settings);
      if (method === 'PATCH') {
        state.settings = PlatformSettingsSchema.parse(await input(request));
        return json(state.settings);
      }
    }
  }
  throw new NotFoundError();
}
