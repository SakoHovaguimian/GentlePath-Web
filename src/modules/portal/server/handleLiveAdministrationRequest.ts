import 'server-only';
import { z } from 'zod';
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { editorialPageSchema } from '@/modules/editorial/models/editorialPage';
import { gentlePathPortalStrings as copy, strings } from '@/strings';
import {
  ManagedUserInputSchema,
  ManagedUserSchema,
} from '../models/managedUser';
import { ManagedUserTransportSchema } from '../models/managedUserTransport';
import { PlatformSettingsSchema } from '../models/platformSettings';
import { PlatformAvailabilityTransportSchema } from '../models/platformAvailabilityTransport';

const json = (body: unknown) =>
  Response.json(body, { headers: { 'cache-control': 'no-store' } });
const withMethod = (request: Request, method: string, body?: unknown) =>
  new Request(request.url, {
    method,
    headers: { 'content-type': 'application/json' },
    signal: request.signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const readInput = (request: Request): Promise<unknown> =>
  request.json().catch(() => {
    throw new ValidationError();
  });
const roleNames = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superadmin',
  OWNER: 'owner',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
  RECEPTIONIST: 'receptionist',
} as const;
const roleValues = {
  user: 'USER',
  admin: 'ADMIN',
  superadmin: 'SUPER_ADMIN',
} as const;
const mapUser = (raw: unknown) => {
  const value = ManagedUserTransportSchema.parse(raw);
  return ManagedUserSchema.parse({
    id: value.id,
    firstName: value.first_name,
    lastName: value.last_name,
    email: value.email,
    role: roleNames[value.role],
    disabled: value.disabled,
    createdAt: value.created_at,
  });
};
const mapSettings = (raw: unknown) => {
  const value = PlatformAvailabilityTransportSchema.parse(raw);
  return PlatformSettingsSchema.parse({
    communityEnabled: value.community_enabled,
    registrationsEnabled: value.registrations_enabled,
    maintenanceMode: value.maintenance_mode,
    resourceReviewRequired: true,
  });
};

export async function handleLiveAdministrationRequest(
  request: Request,
  path: string,
  forward: BackendForward,
): Promise<Response | null> {
  const url = new URL(path, 'http://gentlepath.internal');
  const [area, feature, id, ...extra] = url.pathname
    .split('/')
    .filter(Boolean)
    .map(decodeURIComponent);
  if (area !== 'admin' || !['users', 'settings'].includes(feature)) return null;
  if (extra.length) throw new NotFoundError();
  if (feature === 'users') {
    if (!id && request.method === 'GET') {
      const users: z.infer<typeof ManagedUserSchema>[] = [];
      let offset = 0;
      for (let index = 0; index < 1000; index++) {
        const response = await forward(
          withMethod(request, 'GET'),
          `/managed-users?limit=100&offset=${offset}`,
        );
        if (!response.ok) return response;
        const page = editorialPageSchema(ManagedUserTransportSchema).parse(
          await response.json(),
        );
        users.push(...page.data.map(mapUser));
        if (!page.page.hasMore) return json(users);
        if (page.page.nextOffset === null || page.page.nextOffset <= offset)
          throw new ApiError(strings.errors.unavailable, 502);
        offset = page.page.nextOffset;
      }
      throw new ApiError(strings.errors.unavailable, 502);
    }
    if (id && request.method === 'PATCH') {
      const value = ManagedUserInputSchema.parse(await readInput(request));
      const response = await forward(
        withMethod(request, 'PATCH', {
          ...(value.role === undefined ? {} : { role: roleValues[value.role] }),
          ...(value.disabled === undefined ? {} : { disabled: value.disabled }),
        }),
        `/managed-users/${encodeURIComponent(id)}`,
      );
      return response.ok ? json(mapUser(await response.json())) : response;
    }
  }
  if (feature === 'settings' && !id) {
    if (request.method === 'GET') {
      const response = await forward(
        withMethod(request, 'GET'),
        '/platform-settings',
      );
      return response.ok ? json(mapSettings(await response.json())) : response;
    }
    if (request.method === 'PATCH') {
      const value = PlatformSettingsSchema.parse(await readInput(request));
      if (!value.resourceReviewRequired)
        throw new ValidationError(copy.system.reviewPolicy);
      const response = await forward(
        withMethod(request, 'PATCH', {
          community_enabled: value.communityEnabled,
          registrations_enabled: value.registrationsEnabled,
          maintenance_mode: value.maintenanceMode,
        }),
        '/platform-settings',
      );
      return response.ok ? json(mapSettings(await response.json())) : response;
    }
  }
  throw new NotFoundError();
}
