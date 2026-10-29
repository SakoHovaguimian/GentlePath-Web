import 'server-only';
import { z } from 'zod';
import {
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { NotificationPageSchema } from '../models/notificationPage';
import {
  NotificationInboxFiltersSchema,
  readNotificationInboxQuery,
} from '../models/notificationInboxQuery';
import { NotificationArchiveInputSchema } from '../models/notificationArchiveInput';
import {
  NotificationBulkReadInputSchema,
  NotificationReadInputSchema,
} from '../models/notificationReadInput';
import {
  NotificationPreferencesInputSchema,
  NotificationPreferenceSchema,
} from '../models/notificationPreference';
import {
  NotificationDetectedTimezoneInputSchema,
  NotificationTimezoneInputSchema,
} from '../models/notificationTimezone';
import { NotificationTransportSchema } from './models/notificationTransport';
import { NotificationCountsTransportSchema } from './models/notificationCountsTransport';
import { NotificationSettingsTransportSchema } from './models/notificationSettingsTransport';
import {
  mapNotification,
  mapNotificationCounts,
  mapNotificationSettings,
  notificationFiltersTransport,
  notificationTransportParams,
} from './notificationInboxMappers';

class UpstreamResponse extends Error {
  constructor(readonly response: Response) {
    super();
  }
}
const json = (body: unknown) =>
  Response.json(body, { headers: { 'cache-control': 'no-store' } });

/** Authentication, refresh, origin verification, and credential ownership stay in the shared proxy. */
export async function handleLiveNotificationInboxRequest(
  request: Request,
  path: string,
  forward: BackendForward,
  userId?: string,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, resource, action, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'portal' || feature !== 'notification-inbox') return null;
  if (extra.length) throw new NotFoundError();
  const input = () =>
    request.json().catch(() => {
      throw new ValidationError();
    });
  const read = async <T extends z.ZodType>(
    schema: T,
    endpoint: string,
    method = 'GET',
    body?: unknown,
  ): Promise<z.output<T>> => {
    const response = await forward(
      new Request(request.url, {
        method,
        signal: request.signal,
        headers: {
          accept: 'application/json',
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      endpoint,
    );
    if (!response.ok) throw new UpstreamResponse(response);
    return schema.parse(await response.json());
  };
  const mutationSchema = z.object({
    affected_count: z.number().int().nonnegative(),
    counts: NotificationCountsTransportSchema,
  });
  const mutation = async (endpoint: string, method: string, body?: unknown) => {
    const result = await read(mutationSchema, endpoint, method, body);
    return json({
      affectedCount: result.affected_count,
      counts: mapNotificationCounts(result.counts),
    });
  };
  try {
    if (resource === 'counts' && !action && request.method === 'GET') {
      const filters = NotificationInboxFiltersSchema.omit({ read: true }).parse(
        Object.fromEntries(url.searchParams),
      );
      return json(
        mapNotificationCounts(
          await read(
            NotificationCountsTransportSchema,
            `/notifications/counts?${notificationTransportParams(filters)}`,
          ),
        ),
      );
    }
    if (resource === 'preferences' && !action) {
      if (request.method === 'GET')
        return json(
          await read(
            z.array(NotificationPreferenceSchema),
            '/notifications/preferences',
          ),
        );
      if (request.method === 'PUT')
        return json(
          await read(
            z.array(NotificationPreferenceSchema),
            '/notifications/preferences',
            'PUT',
            NotificationPreferencesInputSchema.parse(await input()),
          ),
        );
    }
    if (resource === 'settings') {
      let settings;
      if (!action && request.method === 'GET')
        settings = await read(
          NotificationSettingsTransportSchema,
          '/user-settings',
        );
      if (action === 'timezone' && request.method === 'PUT') {
        settings = await read(
          NotificationSettingsTransportSchema,
          '/user-settings/timezone',
          'PUT',
          NotificationTimezoneInputSchema.parse(await input()),
        );
      }
      if (action === 'last-timezone' && request.method === 'PUT') {
        const value = NotificationDetectedTimezoneInputSchema.parse(
          await input(),
        );
        settings = await read(
          NotificationSettingsTransportSchema,
          '/user-settings/last-timezone',
          'PUT',
          { last_timezone: value.lastTimezone },
        );
      }
      if (settings) {
        if (userId && settings.user_id !== userId) throw new OwnershipError();
        return json(mapNotificationSettings(settings));
      }
      throw new NotFoundError();
    }
    if (resource === 'read' && !action && request.method === 'PUT') {
      const value = NotificationBulkReadInputSchema.parse(await input());
      return mutation(
        '/notifications/read',
        'PUT',
        value.scope === 'FILTERED'
          ? { ...value, filters: notificationFiltersTransport(value.filters) }
          : value,
      );
    }
    if (!resource && request.method === 'GET') {
      const query = readNotificationInboxQuery(url.searchParams);
      const result = await read(
        z.object({
          data: z.array(NotificationTransportSchema),
          page: NotificationPageSchema.shape.page,
        }),
        `/notifications?${notificationTransportParams(query)}`,
      );
      if (userId && result.data.some((item) => item.user_id !== userId))
        throw new OwnershipError();
      return json({
        data: result.data.map(mapNotification),
        page: result.page,
      });
    }
    if (!resource && request.method === 'DELETE') {
      const value = NotificationArchiveInputSchema.parse(await input());
      const params = notificationTransportParams(
        value.scope === 'FILTERED' ? value.filters : {},
      );
      params.set('scope', value.scope);
      return mutation(`/notifications?${params}`, 'DELETE');
    }
    if (resource) {
      const id = encodeURIComponent(z.string().uuid().parse(resource));
      if (!action && request.method === 'GET') {
        const item = await read(
          NotificationTransportSchema,
          `/notifications/${id}`,
        );
        if (userId && item.user_id !== userId) throw new OwnershipError();
        return json(mapNotification(item));
      }
      if (action === 'read' && request.method === 'PUT')
        return mutation(
          `/notifications/${id}/read`,
          'PUT',
          NotificationReadInputSchema.parse(await input()),
        );
      if (!action && request.method === 'DELETE')
        return mutation(`/notifications/${id}`, 'DELETE');
    }
    throw new NotFoundError();
  } catch (error) {
    if (error instanceof UpstreamResponse) return error.response;
    throw error;
  }
}
