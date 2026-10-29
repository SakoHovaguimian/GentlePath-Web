import { z } from 'zod';
import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import { AdminOverviewSchema } from '../models/adminOverview';
import {
  ManagedUserSchema,
  ManagedUserInputSchema,
  type ManagedUserInput,
} from '../models/managedUser';
import {
  ModerationReportSchema,
  ReportResolutionSchema,
  type ReportResolution,
} from '../models/moderationReport';
import {
  PlatformSettingsSchema,
  type PlatformSettings,
} from '../models/platformSettings';

export class AdminService {
  constructor(private readonly api: ApiClientInterface) {}
  async overview(signal?: AbortSignal) {
    return AdminOverviewSchema.parse(
      await this.api.request('/admin/overview', { signal }),
    );
  }
  async users(signal?: AbortSignal) {
    return z
      .array(ManagedUserSchema)
      .parse(await this.api.request('/admin/users', { signal }));
  }
  async updateUser(id: string, input: ManagedUserInput) {
    return ManagedUserSchema.parse(
      await this.api.request(`/admin/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: validateInput(ManagedUserInputSchema, input),
      }),
    );
  }
  async reports(signal?: AbortSignal) {
    return z
      .array(ModerationReportSchema)
      .parse(await this.api.request('/admin/reports', { signal }));
  }
  async resolveReport(id: string, input: ReportResolution) {
    return ModerationReportSchema.parse(
      await this.api.request(`/admin/reports/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: validateInput(ReportResolutionSchema, input),
      }),
    );
  }
  async settings(signal?: AbortSignal) {
    return PlatformSettingsSchema.parse(
      await this.api.request('/admin/settings', { signal }),
    );
  }
  async saveSettings(input: PlatformSettings) {
    return PlatformSettingsSchema.parse(
      await this.api.request('/admin/settings', {
        method: 'PATCH',
        body: validateInput(PlatformSettingsSchema, input),
      }),
    );
  }
}
