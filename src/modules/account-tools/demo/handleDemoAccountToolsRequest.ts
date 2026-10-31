import 'server-only';
import { z } from 'zod';
import {
  AuthError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import type { ServerSession } from '@/services/session/models/serverSession';
import type { DemoContext } from '@/models/demoContext';
import { getDemoState } from '@/services/demo/demoState';
import {
  gentlePathAccountToolsStrings as copy,
  gentlePathHelpFaqSections,
} from '@/strings';
import { AccountDeletionSchema } from '../models/accountDeletion';
import { AccountDeviceQuerySchema } from '../models/accountDeviceQuery';
import {
  AccountToolsPagingSchema,
  type AccountToolsPaging,
} from '../models/accountToolsPaging';
import { NotificationDeliveryQuerySchema } from '../models/notificationDeliveryQuery';
import { LegalContextSchema } from '../models/legalInformation';
import { getDemoAccountToolsState } from './accountToolsState';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
const noContent = () =>
  new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });

export async function handleDemoAccountToolsRequest(
  request: Request,
  path: string,
  session: ServerSession,
  context: DemoContext,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, resource, id, action, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (feature !== 'account-tools' || !['portal', 'admin'].includes(area))
    return null;
  if (extra.length) throw new NotFoundError();
  const accounts = getDemoState();
  const current = accounts.users.find(
    (user) =>
      user.id === session.user.id &&
      user.external_id === session.auth.externalId &&
      !user.deleted &&
      !user.disabled,
  );
  if (!session.demo || !current) throw new AuthError();
  const administrative = area === 'admin';
  if (administrative && current.role !== 'superadmin')
    throw new OwnershipError();
  const state = getDemoAccountToolsState();
  const method = request.method;
  const rawQuery = Object.fromEntries(url.searchParams);
  const readInput = () =>
    request.json().catch(() => {
      throw new ValidationError();
    });
  const page = <T>(rows: T[], paging: AccountToolsPaging) => {
    if (context.scenario === 'empty') rows = [];
    const data = rows.slice(paging.offset, paging.offset + paging.limit);
    const hasMore = paging.offset + data.length < rows.length;
    return {
      data,
      page: {
        limit: paging.limit,
        offset: paging.offset,
        hasMore,
        nextOffset: hasMore ? paging.offset + paging.limit : null,
      },
    };
  };
  if (!administrative) {
    if (resource === 'account' && !id && !action && method === 'DELETE') {
      const input = AccountDeletionSchema.parse(await readInput());
      if (input.confirmationEmail !== current.email)
        throw new ValidationError(copy.validation.emailMismatch);
      current.deleted = true;
      current.updated_at = new Date().toISOString();
      accounts.credentials.delete(current.external_id);
      for (const [token, externalId] of accounts.refreshTokens) {
        if (externalId === current.external_id)
          accounts.refreshTokens.delete(token);
      }
      return noContent();
    }
    if (resource === 'devices' && !action) {
      if (!id && method === 'GET') {
        const query = AccountDeviceQuerySchema.parse(rawQuery);
        const search = query.query.toLowerCase();
        const rows = state.devices.filter(
          (device) =>
            device.userId === current.id &&
            (!query.deviceType || device.deviceType === query.deviceType) &&
            device.deviceType.toLowerCase().includes(search),
        );
        return json(
          page(
            rows.map(({ id: deviceId, deviceType, createdAt, updatedAt }) => ({
              id: deviceId,
              deviceType,
              createdAt,
              updatedAt,
            })),
            query,
          ),
        );
      }
      if (id && method === 'DELETE') {
        z.string().uuid().parse(id);
        const device = state.devices.find(
          (device) => device.id === id && device.userId === current.id,
        );
        if (!device) throw new NotFoundError();
        state.devices = state.devices.filter((device) => device.id !== id);
        return noContent();
      }
    }
    if (resource === 'legal' && !id && !action && method === 'GET') {
      z.object({ context: LegalContextSchema }).strict().parse(rawQuery);
      return json({
        illustrative: true,
        items:
          context.scenario === 'empty'
            ? []
            : [
                {
                  title: copy.demo.legalTitle,
                  sections: [copy.demo.legalDescription],
                },
              ],
      });
    }
    if (resource === 'faq' && !id && !action && method === 'GET') {
      return json({
        illustrative: false,
        sections: context.scenario === 'empty' ? [] : gentlePathHelpFaqSections,
      });
    }
  } else {
    if (resource === 'deliveries') {
      if (!id && !action && method === 'GET') {
        const query = NotificationDeliveryQuerySchema.parse(rawQuery);
        const rows = state.deliveries.filter(
          (delivery) =>
            (!query.status || delivery.status === query.status) &&
            (!query.notificationId ||
              delivery.notificationId === query.notificationId) &&
            (!query.createdAfter ||
              (delivery.createdAt !== null &&
                delivery.createdAt >= query.createdAfter)) &&
            (!query.createdBefore ||
              (delivery.createdAt !== null &&
                delivery.createdAt <= query.createdBefore)),
        );
        return json(page(rows, query));
      }
      if (id && action === 'attempts' && method === 'GET') {
        z.string().uuid().parse(id);
        if (!state.deliveries.some((delivery) => delivery.id === id))
          throw new NotFoundError();
        return json(
          page(
            state.attempts.get(id) ?? [],
            AccountToolsPagingSchema.strict().parse(rawQuery),
          ),
        );
      }
    }
  }
  throw new NotFoundError();
}
