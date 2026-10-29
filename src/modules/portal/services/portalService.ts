import { z } from 'zod';
import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import { PortalOverviewSchema } from '../models/portalOverview';
import {
  ChildProfileInputSchema,
  ChildProfileSchema,
  type ChildProfileInput,
} from '../models/childProfile';
import {
  JournalEntrySchema,
  JournalInputSchema,
  type JournalInput,
} from '../models/journalEntry';
import { ResourceSchema } from '../models/resource';
import {
  MilestoneSchema,
  ObservationInputSchema,
  type ObservationInput,
} from '../models/milestone';

export class PortalService {
  constructor(private readonly api: ApiClientInterface) {}
  async overview(signal?: AbortSignal) {
    return PortalOverviewSchema.parse(
      await this.api.request('/portal/overview', { signal }),
    );
  }
  async children(signal?: AbortSignal) {
    return z
      .array(ChildProfileSchema)
      .parse(await this.api.request('/portal/children', { signal }));
  }
  async saveChild(input: ChildProfileInput, id?: string) {
    return ChildProfileSchema.parse(
      await this.api.request(
        `/portal/children${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PATCH' : 'POST',
          body: validateInput(ChildProfileInputSchema, input),
        },
      ),
    );
  }
  async deleteChild(id: string) {
    await this.api.request(`/portal/children/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async journals(signal?: AbortSignal) {
    return z
      .array(JournalEntrySchema)
      .parse(await this.api.request('/portal/journals', { signal }));
  }
  async saveJournal(input: JournalInput, id?: string) {
    return JournalEntrySchema.parse(
      await this.api.request(
        `/portal/journals${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PATCH' : 'POST',
          body: validateInput(JournalInputSchema, input),
        },
      ),
    );
  }
  async deleteJournal(id: string) {
    await this.api.request(`/portal/journals/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async resources(signal?: AbortSignal) {
    return z
      .array(ResourceSchema)
      .parse(await this.api.request('/portal/resources', { signal }));
  }
  async saveResource(id: string, saved: boolean) {
    return ResourceSchema.parse(
      await this.api.request(
        `/portal/resources/${encodeURIComponent(id)}/favorite`,
        { method: 'POST', body: { saved } },
      ),
    );
  }
  async milestones(childId: string, signal?: AbortSignal) {
    return z
      .array(MilestoneSchema)
      .parse(
        await this.api.request(
          `/portal/milestones?childId=${encodeURIComponent(childId)}`,
          { signal },
        ),
      );
  }
  async observeMilestone(id: string, input: ObservationInput) {
    return MilestoneSchema.parse(
      await this.api.request(`/portal/milestones/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: validateInput(ObservationInputSchema, input),
      }),
    );
  }
}
