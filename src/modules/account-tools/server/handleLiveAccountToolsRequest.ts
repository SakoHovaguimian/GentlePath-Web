import 'server-only';
import { z } from 'zod';
import {
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { AccountDeletionSchema } from '../models/accountDeletion';
import { AccountDeviceQuerySchema } from '../models/accountDeviceQuery';
import { AccountToolsPagingSchema } from '../models/accountToolsPaging';
import { accountToolsPageSchema } from '../models/accountToolsPage';
import { NotificationDeliveryQuerySchema } from '../models/notificationDeliveryQuery';
import { AIUsageQuerySchema } from '../models/aiUsageQuery';
import { AIUsageEventInputSchema } from '../models/aiUsageEvent';
import {
  LegalContextSchema,
  LegalItemSchema,
} from '../models/legalInformation';
import { FrequentlyAskedQuestionSectionSchema } from '../models/frequentlyAskedQuestions';
import { accountToolsQueryParams } from '../accountToolsQueryParams';
import { AccountDeviceTransportSchema } from './models/accountDeviceTransport';
import { NotificationDeliveryTransportSchema } from './models/notificationDeliveryTransport';
import { NotificationAttemptTransportSchema } from './models/notificationAttemptTransport';
import { AIUsageTransportSchema } from './models/aiUsageTransport';
import {
  mapAccountDevice,
  mapNotificationDelivery,
  mapNotificationAttempt,
  mapAIUsage,
  aiUsageInputTransport,
} from './accountToolsMappers';

class UpstreamResponse extends Error {
  constructor(readonly response: Response) {
    super();
  }
}
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const noContent = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });

/** The authenticated proxy owns session verification, origin checks, and refresh. */
export async function handleLiveAccountToolsRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  userId?: string,
  role?: string,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, resource, id, action, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (feature !== 'account-tools' || !['portal', 'admin'].includes(area))
    return null;
  if (extra.length) throw new NotFoundError();
  const administrative = area === 'admin';
  if (administrative && role !== 'superadmin') throw new OwnershipError();
  const method = request.method;
  const readInput = () =>
    request.json().catch(() => {
      throw new ValidationError();
    });
  const call = async (upstreamPath: string, verb = 'GET', body?: unknown) => {
    const response = await forward(
      new Request(request.url, {
        method: verb,
        signal: request.signal,
        headers: {
          accept: 'application/json',
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      upstreamPath,
    );
    if (!response.ok) throw new UpstreamResponse(response);
    return response;
  };
  const read = async <T extends z.ZodType>(
    schema: T,
    upstreamPath: string,
    verb = 'GET',
    body?: unknown,
  ): Promise<z.output<T>> =>
    schema.parse(await (await call(upstreamPath, verb, body)).json());
  try {
    if (!administrative) {
      if (resource === 'account' && !id && !action && method === 'DELETE') {
        const input = AccountDeletionSchema.parse(await readInput());
        const account = await read(
          z.object({ id: z.string().uuid(), email: z.email() }),
          '/users/profile',
        );
        if (userId && account.id !== userId) throw new OwnershipError();
        if (account.email !== input.confirmationEmail)
          throw new ValidationError(copy.validation.emailMismatch);
        await call(`/users/${encodeURIComponent(account.id)}`, 'DELETE');
        // The caller clears the encrypted session cookie only after success.
        return noContent();
      }
      if (resource === 'devices' && !action) {
        if (!id && method === 'GET') {
          const query = AccountDeviceQuerySchema.parse(
            Object.fromEntries(url.searchParams),
          );
          const params = accountToolsQueryParams({
            query: query.query,
            device_type: query.deviceType,
            limit: query.limit,
            offset: query.offset,
          });
          const result = await read(
            accountToolsPageSchema(AccountDeviceTransportSchema),
            `/devices?${params}`,
          );
          if (userId && result.data.some((device) => device.user_id !== userId))
            throw new OwnershipError();
          return json({
            data: result.data.map(mapAccountDevice),
            page: result.page,
          });
        }
        if (id && method === 'DELETE') {
          const device = await read(
            AccountDeviceTransportSchema,
            `/devices/${encodeURIComponent(z.string().uuid().parse(id))}`,
          );
          if (userId && device.user_id !== userId) throw new OwnershipError();
          await call('/devices', 'DELETE', {
            device_token: device.device_token,
          });
          return noContent();
        }
      }
      if (resource === 'legal' && !id && !action && method === 'GET') {
        const { context } = z
          .object({ context: LegalContextSchema })
          .strict()
          .parse(Object.fromEntries(url.searchParams));
        const items = await read(
          z.array(LegalItemSchema),
          `/system/legal-information?${accountToolsQueryParams({ context })}`,
        );
        return json({ illustrative: false, items });
      }
      if (resource === 'faq' && !id && !action && method === 'GET') {
        const value = await read(
          z.object({ sections: z.array(FrequentlyAskedQuestionSectionSchema) }),
          '/system/faq',
        );
        return json({ illustrative: false, sections: value.sections });
      }
    } else {
      if (resource === 'deliveries') {
        if (!id && !action && method === 'GET') {
          const query = NotificationDeliveryQuerySchema.parse(
            Object.fromEntries(url.searchParams),
          );
          const params = accountToolsQueryParams({
            notification_id: query.notificationId,
            status: query.status,
            created_after: query.createdAfter,
            created_before: query.createdBefore,
            limit: query.limit,
            offset: query.offset,
          });
          const result = await read(
            accountToolsPageSchema(NotificationDeliveryTransportSchema),
            `/notification-deliveries?${params}`,
          );
          return json({
            data: result.data.map(mapNotificationDelivery),
            page: result.page,
          });
        }
        if (id && action === 'attempts' && method === 'GET') {
          const paging = AccountToolsPagingSchema.strict().parse(
            Object.fromEntries(url.searchParams),
          );
          const result = await read(
            accountToolsPageSchema(NotificationAttemptTransportSchema),
            `/notification-deliveries/${encodeURIComponent(z.string().uuid().parse(id))}/attempts?${accountToolsQueryParams(paging)}`,
          );
          return json({
            data: result.data.map(mapNotificationAttempt),
            page: result.page,
          });
        }
      }
      if (resource === 'ai-usage' && !action) {
        const upstreamPath = `/ai-usage-events${id ? `/${encodeURIComponent(z.string().uuid().parse(id))}` : ''}`;
        if (!id && method === 'GET') {
          const query = AIUsageQuerySchema.parse(
            Object.fromEntries(url.searchParams),
          );
          const params = accountToolsQueryParams({
            query: query.query,
            user_id: query.userId,
            ai_usage_type: query.context,
            deleted: query.deleted,
            limit: query.limit,
            offset: query.offset,
          });
          const result = await read(
            accountToolsPageSchema(AIUsageTransportSchema),
            `${upstreamPath}?${params}`,
          );
          return json({ data: result.data.map(mapAIUsage), page: result.page });
        }
        if ((!id && method === 'POST') || (id && method === 'PATCH')) {
          const input = AIUsageEventInputSchema.parse(await readInput());
          const existing = id
            ? await read(AIUsageTransportSchema, upstreamPath)
            : undefined;
          const body = { ...existing, ...aiUsageInputTransport(input) };
          const value = await read(
            AIUsageTransportSchema,
            upstreamPath,
            id ? 'PUT' : 'POST',
            body,
          );
          return json(mapAIUsage(value), id ? 200 : 201);
        }
        if (id && method === 'DELETE') {
          await call(upstreamPath, 'DELETE');
          return noContent();
        }
      }
    }
    throw new NotFoundError();
  } catch (error) {
    if (error instanceof UpstreamResponse) return error.response;
    throw error;
  }
}
