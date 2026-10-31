import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import {
  ServiceApplicationSchema,
  ServiceApplicationCreateSchema,
  ServiceApplicationUpdateSchema,
  type ServiceApplicationCreate,
  type ServiceApplicationUpdate,
} from '../models/serviceApplication';
import {
  ApplicationFollowUpSchema,
  ApplicationFollowUpCreateSchema,
  ApplicationFollowUpUpdateSchema,
  ApplicationFollowUpCompletionSchema,
  type ApplicationFollowUpCreate,
  type ApplicationFollowUpUpdate,
  type ApplicationFollowUpCompletion,
} from '../models/applicationFollowUp';
import {
  ApplicationQuerySchema,
  type ApplicationQuery,
} from '../models/applicationQuery';
import {
  ApplicationPageSchema,
  ApplicationPriorityPageSchema,
} from '../models/applicationPage';

const base = '/portal/applications';

export class ApplicationService {
  constructor(private readonly api: ApiClientInterface) {}

  async list(input: ApplicationQuery, signal?: AbortSignal) {
    const query = validateInput(ApplicationQuerySchema, input);
    const params = new URLSearchParams({
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.query) params.set('query', query.query);
    if (query.status) params.set('status', query.status);
    if (query.child_id) params.set('child_id', query.child_id);
    if (query.personal_only) params.set('personal_only', 'true');
    return ApplicationPageSchema.parse(
      await this.api.request(`${base}?${params}`, { signal }),
    );
  }

  async get(id: string, signal?: AbortSignal) {
    return ServiceApplicationSchema.parse(
      await this.api.request(`${base}/${encodeURIComponent(id)}`, { signal }),
    );
  }

  async priority(limit = 3, offset = 0, signal?: AbortSignal) {
    return ApplicationPriorityPageSchema.parse(
      await this.api.request(
        `${base}/priority-follow-ups?limit=${limit}&offset=${offset}`,
        { signal },
      ),
    );
  }

  async create(input: ServiceApplicationCreate) {
    return ServiceApplicationSchema.parse(
      await this.api.request(base, {
        method: 'POST',
        body: validateInput(ServiceApplicationCreateSchema, input),
      }),
    );
  }

  async update(id: string, input: ServiceApplicationUpdate) {
    return ServiceApplicationSchema.parse(
      await this.api.request(`${base}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: validateInput(ServiceApplicationUpdateSchema, input),
      }),
    );
  }

  async remove(id: string) {
    await this.api.request(`${base}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  async createFollowUp(id: string, input: ApplicationFollowUpCreate) {
    return ApplicationFollowUpSchema.parse(
      await this.api.request(`${base}/${encodeURIComponent(id)}/follow-ups`, {
        method: 'POST',
        body: validateInput(ApplicationFollowUpCreateSchema, input),
      }),
    );
  }

  async updateFollowUp(
    id: string,
    followUpId: string,
    input: ApplicationFollowUpUpdate,
  ) {
    return ApplicationFollowUpSchema.parse(
      await this.api.request(
        `${base}/${encodeURIComponent(id)}/follow-ups/${encodeURIComponent(followUpId)}`,
        {
          method: 'PUT',
          body: validateInput(ApplicationFollowUpUpdateSchema, input),
        },
      ),
    );
  }

  async completeFollowUp(
    id: string,
    followUpId: string,
    input: ApplicationFollowUpCompletion,
  ) {
    return ApplicationFollowUpSchema.parse(
      await this.api.request(
        `${base}/${encodeURIComponent(id)}/follow-ups/${encodeURIComponent(followUpId)}/completion`,
        {
          method: 'PUT',
          body: validateInput(ApplicationFollowUpCompletionSchema, input),
        },
      ),
    );
  }

  async deleteFollowUp(id: string, followUpId: string) {
    await this.api.request(
      `${base}/${encodeURIComponent(id)}/follow-ups/${encodeURIComponent(followUpId)}`,
      { method: 'DELETE' },
    );
  }
}
