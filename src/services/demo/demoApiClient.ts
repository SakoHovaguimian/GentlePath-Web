import 'server-only';
import { z } from 'zod';
import { UserMutationInputSchema } from '@/models/user';
import { FeatureRequestMutationInputSchema } from '@/models/featureRequest';
import {
  AuthError,
  ApiError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import { strings, gentlePathDemoStrings } from '@/strings';
import { ChatMessageInputSchema } from '@/modules/chat/models/chatMessage';
import type { ServerSession } from '@/services/session/models/serverSession';
import { getDemoState } from './demoState';
import { dashboardModelMeta } from './demoFixtures';
import { mapUserMutationToTransport } from '../api/domainMappers';
import type { DemoContext } from '@/models/demoContext';
import { getDemoContext } from './demoRuntime';
import { simulateDemoRequest } from './demoSimulation';
import { handleDemoPortalRequest } from './demoPortalApi';
import { handleDemoBlogRequest } from './demoBlogApi';
import { getDemoPortalState } from './demoPortalState';
import { handleDocumentVaultRequest } from '@/modules/documents/demo/handleDocumentVaultRequest';
import { handleCommunityRequest } from '@/modules/community/demo/handleCommunityRequest';
import { handlePollRequest } from '@/modules/polls/demo/handlePollRequest';
import { handleEditorialRequest } from '@/modules/editorial/server/handleDemoEditorialRequest';
import { handleEngagementRequest } from '@/modules/engagement/demo/handleEngagementRequest';
import { handleMilestoneAdminRequest } from '@/modules/milestone-admin/server/handleMilestoneAdminRequest';
import { handleDemoAccountToolsRequest } from '@/modules/account-tools/demo/handleDemoAccountToolsRequest';
import { handleCommercialRequest } from '@/modules/commercial/server/demoCommercialApi';
import { handleNotificationInboxRequest } from '@/modules/notification-inbox/demo/handleNotificationInboxRequest';
const PageQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
  offset: z.coerce.number().int().min(0).default(0),
});
export class DemoApiClient {
  async proxy(
    request: Request,
    path: string,
    session: ServerSession,
    context?: DemoContext,
  ): Promise<Response> {
    context ??= await getDemoContext();
    const state = getDemoState();
    const current = state.users.find(
      (user) =>
        user.id === session.user.id &&
        user.external_id === session.auth.externalId &&
        !user.disabled &&
        !user.deleted,
    );
    if (!current || !session.demo)
      throw new AuthError(strings.errors.sessionExpired);
    const url = new URL(path, 'http://portal.internal');
    const parts = url.pathname
      .split('/')
      .filter(Boolean)
      .map(decodeURIComponent);
    const [resource, id] = parts;
    const method = request.method;
    const trustedSession = {
      ...session,
      user: { ...session.user, role: current.role ?? ('user' as const) },
    };
    const { settings } = getDemoPortalState();
    if (
      settings.maintenanceMode &&
      trustedSession.user.role === 'user' &&
      ['portal', 'feature-requests', 'chat'].includes(resource)
    )
      throw new ApiError(gentlePathDemoStrings.maintenanceActive, 503);
    if (!settings.communityEnabled && resource === 'chat' && method !== 'GET')
      throw new OwnershipError(gentlePathDemoStrings.communityPaused);
    if (resource === 'admin' && trustedSession.user.role === 'user')
      throw new OwnershipError();
    if (
      ((resource === 'users' && id !== 'profile' && id !== current.id) ||
        resource === 'dashboard') &&
      trustedSession.user.role === 'user'
    )
      throw new OwnershipError();
    await simulateDemoRequest(context);
    const documents = await handleDocumentVaultRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (documents) return documents;
    const community = await handleCommunityRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (community) return community;
    const polls = await handlePollRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (polls) return polls;
    const editorial = await handleEditorialRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (editorial) return editorial;
    const engagement = await handleEngagementRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (engagement) return engagement;
    const milestoneTools = await handleMilestoneAdminRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (milestoneTools) return milestoneTools;
    const accountTools = await handleDemoAccountToolsRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (accountTools) return accountTools;
    const commercial = await handleCommercialRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (commercial) return commercial;
    const notifications = await handleNotificationInboxRequest(
      request,
      path,
      trustedSession,
      context,
    );
    if (notifications) return notifications;
    if (resource === 'portal' || resource === 'admin')
      return handleDemoPortalRequest(request, path, trustedSession, context);
    if (resource === 'blog') {
      const response = await handleDemoBlogRequest(
        request,
        path,
        trustedSession.user,
      );
      if (context.scenario === 'empty' && method === 'GET' && !id) {
        const body: unknown = await response.clone().json();
        if (Array.isArray(body))
          return Response.json([], {
            headers: { 'cache-control': 'no-store' },
          });
        if (
          body &&
          typeof body === 'object' &&
          'data' in body &&
          Array.isArray(body.data)
        )
          return Response.json(
            { ...body, data: [], total: 0, offset: 0 },
            { headers: { 'cache-control': 'no-store' } },
          );
      }
      return response;
    }
    const json = (body: unknown, status = 200) =>
      Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
    const input = async () =>
      request.json().catch(() => {
        throw new ValidationError(strings.errors.invalidInput);
      });
    const page = <T>(rows: T[]) => {
      if (context.scenario === 'empty') rows = [];
      const { limit, offset } = PageQuerySchema.parse(
        Object.fromEntries(url.searchParams),
      );
      return {
        data: rows.slice(offset, offset + limit),
        total: rows.length,
        limit,
        offset,
      };
    };
    const search = (
      url.searchParams.get('query') ||
      url.searchParams.get('search') ||
      ''
    )
      .trim()
      .toLowerCase();
    const visibleRequests = state.featureRequests.filter(
      (item) => !item.deleted && item.user_id === current.id,
    );
    if (resource === 'users') {
      if (method === 'GET' && !id)
        return json(
          page(
            state.users
              .filter(
                (user) =>
                  !user.deleted &&
                  [user.first_name, user.last_name, user.email].some((value) =>
                    value.toLowerCase().includes(search),
                  ),
              )
              .map((user) => ({
                ...user,
                phone_number: null,
                date_of_birth: null,
              })),
          ),
        );
      const user =
        id === 'profile' ? current : state.users.find((user) => user.id === id);
      if (!user) throw new NotFoundError();
      if (method === 'GET') {
        if (user.id !== current.id) throw new OwnershipError();
        return json(user);
      }
      if (method === 'PUT' && id !== 'profile') {
        if (user.id !== current.id) throw new OwnershipError();
        const raw = await input();
        const validated = UserMutationInputSchema.parse({
          firstName: raw.first_name,
          lastName: raw.last_name,
          email: raw.email,
          phoneNumber: raw.phone_number,
          dateOfBirth: raw.date_of_birth,
        });
        if (validated.email !== current.email)
          throw new ValidationError(strings.errors.invalidInput);
        Object.assign(user, mapUserMutationToTransport(validated), {
          updated_at: new Date().toISOString(),
        });
        return json(user);
      }
    }
    if (resource === 'feature-requests') {
      if (method === 'GET' && !id)
        return json(
          page(
            visibleRequests
              .filter((item) => item.message.toLowerCase().includes(search))
              .map((item) => ({ ...item, user: current })),
          ),
        );
      if (method === 'POST' && !id) {
        const body = FeatureRequestMutationInputSchema.parse(await input());
        const now = new Date().toISOString();
        const item = {
          id: crypto.randomUUID(),
          user_id: current.id,
          message: body.message,
          created_at: now,
          updated_at: now,
          deleted: false,
          user: current,
        };
        state.featureRequests.unshift(item);
        return json(item, 201);
      }
      const item = visibleRequests.find((item) => item.id === id);
      if (!item) throw new NotFoundError();
      if (method === 'GET') return json({ ...item, user: current });
      if (method === 'PATCH') {
        item.message = FeatureRequestMutationInputSchema.parse(
          await input(),
        ).message;
        item.updated_at = new Date().toISOString();
        return json(item);
      }
      if (method === 'DELETE') {
        item.deleted = true;
        return new Response(null, { status: 204 });
      }
    }
    if (resource === 'dashboard' && method === 'GET') {
      const models = [
        {
          key: 'user',
          display_name: strings.ui.demoApiClient.users,
          field_count: 10,
          record_count: state.users.length,
        },
        {
          key: 'featureRequest',
          display_name: strings.ui.demoApiClient.featureRequests,
          field_count: 7,
          record_count: visibleRequests.length,
        },
      ];
      if (id === 'overview')
        return json({
          models: models.map((model) => ({
            model: model.key,
            display_name: model.display_name,
            total_count: model.record_count,
            period_count: (model.key === 'user'
              ? state.users
              : visibleRequests
            ).filter(
              (item) =>
                Date.parse(item.created_at) >= Date.now() - 30 * 86400000,
            ).length,
            growth_percent: null,
          })),
          date_range: {
            from: new Date(Date.now() - 30 * 86400000).toISOString(),
            to: new Date().toISOString(),
          },
        });
      if (id === 'models' && !parts[2]) return json({ models });
      if (id === 'models') {
        const meta = dashboardModelMeta[parts[2]];
        if (!meta) throw new NotFoundError();
        return json({
          ...meta,
          total_records:
            parts[2] === 'user' ? state.users.length : visibleRequests.length,
        });
      }
      if (id === 'records') {
        const model = url.searchParams.get('model');
        if (model !== 'user' && model !== 'featureRequest')
          throw new NotFoundError();
        const rows =
          model === 'user'
            ? state.users.map((user) => ({
                ...user,
                phone_number: null,
                date_of_birth: null,
              }))
            : visibleRequests;
        return json(
          page(
            rows.filter((item) =>
              JSON.stringify(item).toLowerCase().includes(search),
            ),
          ),
        );
      }
    }
    if (resource === 'chat' && id === 'messages') {
      if (method === 'GET')
        return json(
          context.scenario === 'empty' ? [] : state.messages.slice(-100),
        );
      if (method === 'POST') {
        const body = ChatMessageInputSchema.parse(await input());
        const message = {
          id: crypto.randomUUID(),
          userId: current.id,
          author: `${current.first_name} ${current.last_name}`,
          message: body.message,
          createdAt: new Date().toISOString(),
        };
        state.messages.push(message);
        return json(message, 201);
      }
    }
    throw new NotFoundError();
  }
}
