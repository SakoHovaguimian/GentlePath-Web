import { z } from 'zod';
import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { NotificationPageSchema } from '../models/notificationPage';
import { NotificationCountsSchema } from '../models/notificationCounts';
import { NotificationMutationResultSchema } from '../models/notificationMutationResult';
import {
  NotificationInboxQuerySchema,
  type NotificationInboxQuery,
  type NotificationInboxFilters,
} from '../models/notificationInboxQuery';
import {
  NotificationArchiveInputSchema,
  type NotificationArchiveInput,
} from '../models/notificationArchiveInput';
import {
  NotificationBulkReadInputSchema,
  type NotificationBulkReadInput,
} from '../models/notificationReadInput';
import {
  NotificationPreferenceSchema,
  NotificationPreferencesInputSchema,
  type NotificationPreferencesInput,
} from '../models/notificationPreference';
import {
  NotificationTimezoneInputSchema,
  NotificationDetectedTimezoneInputSchema,
} from '../models/notificationTimezone';
import { NotificationUserSettingsSchema } from '../models/notificationUserSettings';
import { notificationInboxQueryParams } from '../notificationInboxQueryParams';

const root = '/portal/notification-inbox';
export class NotificationInboxService {
  constructor(private readonly api: ApiClientInterface) {}
  async inbox(query: NotificationInboxQuery, signal?: AbortSignal) {
    return NotificationPageSchema.parse(
      await this.api.request(
        `${root}?${notificationInboxQueryParams(NotificationInboxQuerySchema.parse(query))}`,
        { signal },
      ),
    );
  }
  async counts(
    filters: Omit<NotificationInboxFilters, 'read'> = {},
    signal?: AbortSignal,
  ) {
    return NotificationCountsSchema.parse(
      await this.api.request(
        `${root}/counts?${notificationInboxQueryParams(filters)}`,
        { signal },
      ),
    );
  }
  async setRead(id: string, read: boolean) {
    return NotificationMutationResultSchema.parse(
      await this.api.request(
        `${root}/${encodeURIComponent(z.string().uuid().parse(id))}/read`,
        { method: 'PUT', body: { read } },
      ),
    );
  }
  async setBulkRead(input: NotificationBulkReadInput) {
    return NotificationMutationResultSchema.parse(
      await this.api.request(`${root}/read`, {
        method: 'PUT',
        body: NotificationBulkReadInputSchema.parse(input),
      }),
    );
  }
  async archive(id: string) {
    return NotificationMutationResultSchema.parse(
      await this.api.request(
        `${root}/${encodeURIComponent(z.string().uuid().parse(id))}`,
        { method: 'DELETE' },
      ),
    );
  }
  async archiveBulk(input: NotificationArchiveInput) {
    return NotificationMutationResultSchema.parse(
      await this.api.request(root, {
        method: 'DELETE',
        body: NotificationArchiveInputSchema.parse(input),
      }),
    );
  }
  async preferences(signal?: AbortSignal) {
    return z
      .array(NotificationPreferenceSchema)
      .parse(await this.api.request(`${root}/preferences`, { signal }));
  }
  async savePreferences(input: NotificationPreferencesInput) {
    return z.array(NotificationPreferenceSchema).parse(
      await this.api.request(`${root}/preferences`, {
        method: 'PUT',
        body: NotificationPreferencesInputSchema.parse(input),
      }),
    );
  }
  async settings(signal?: AbortSignal) {
    return NotificationUserSettingsSchema.parse(
      await this.api.request(`${root}/settings`, { signal }),
    );
  }
  async setTimezone(timezone: string | null) {
    return NotificationUserSettingsSchema.parse(
      await this.api.request(`${root}/settings/timezone`, {
        method: 'PUT',
        body: NotificationTimezoneInputSchema.parse({ timezone }),
      }),
    );
  }
  async syncDetectedTimezone(lastTimezone: string) {
    return NotificationUserSettingsSchema.parse(
      await this.api.request(`${root}/settings/last-timezone`, {
        method: 'PUT',
        body: NotificationDetectedTimezoneInputSchema.parse({ lastTimezone }),
      }),
    );
  }
}
