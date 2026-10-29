import { z } from 'zod';
import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import {
  DemoSettingsSchema,
  DemoSettingsInputSchema,
  type DemoSettingsInput,
} from '@/models/demoSettings';
import { AppSessionSchema } from '@/models/appSession';
import { UserRoleSchema, type UserRole } from '@/models/userRole';

export class DevSettingsService {
  constructor(private readonly api: ApiClientInterface) {}

  async read(signal?: AbortSignal) {
    return DemoSettingsSchema.parse(await this.api.request('/', { signal }));
  }

  async update(input: DemoSettingsInput) {
    return z.object({ reload: z.boolean() }).parse(
      await this.api.request('/', {
        method: 'PUT',
        body: DemoSettingsInputSchema.parse(input),
      }),
    );
  }

  async switchRole(role: UserRole) {
    return AppSessionSchema.parse(
      await this.api.request('/role', {
        method: 'POST',
        body: { role: UserRoleSchema.parse(role) },
      }),
    );
  }

  async reset() {
    return AppSessionSchema.parse(
      await this.api.request('/reset', { method: 'POST' }),
    );
  }

  async enableDemoMode() {
    return z
      .object({ demoMode: z.literal(true) })
      .parse(await this.api.request('/demo', { method: 'POST' }));
  }
}
