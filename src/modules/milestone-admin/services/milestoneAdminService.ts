import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import {
  MilestoneGuidanceSchema,
  MilestoneGuidanceInputSchema,
  type MilestoneGuidanceInput,
} from '../models/milestoneGuidance';
import {
  FamilyTipSchema,
  FamilyTipInputSchema,
  FamilyTipUpdateSchema,
  type FamilyTipInput,
} from '../models/familyTip';
import { TipReviewInputSchema, type TipReviewInput } from '../models/tipReview';
import { milestoneAdminPageSchema } from '../models/milestoneAdminPage';
import {
  milestoneAdminQueryParams,
  type MilestoneAdminQuery,
} from '../models/milestoneAdminQuery';
import {
  MilestoneObservationSchema,
  MilestoneObservationInputSchema,
  MilestoneObservationUpdateSchema,
  type MilestoneObservationInput,
} from '../models/milestoneObservation';
import type { MilestoneObservationQuery } from '../models/milestoneObservationQuery';
import { MilestoneProgressSummarySchema } from '../models/milestoneProgressSummary';

export class MilestoneAdminService {
  constructor(private readonly api: ApiClientInterface) {}
  async milestones(query: MilestoneAdminQuery, signal?: AbortSignal) {
    const { query: search, tag, limit, offset, child_id, progress } = query;
    const params = milestoneAdminQueryParams({
      query: search,
      tag,
      limit,
      offset,
      milestone_id: '',
      child_id,
      progress,
    });
    return milestoneAdminPageSchema(MilestoneGuidanceSchema).parse(
      await this.api.request(`/portal/milestone-tools?${params}`, { signal }),
    );
  }
  async progressSummary(childId: string, signal?: AbortSignal) {
    const params = new URLSearchParams({ child_id: childId });
    return MilestoneProgressSummarySchema.parse(
      await this.api.request(`/portal/milestone-tools/progress?${params}`, {
        signal,
      }),
    );
  }
  async milestone(id: string, signal?: AbortSignal) {
    return MilestoneGuidanceSchema.parse(
      await this.api.request(
        `/portal/milestone-tools/${encodeURIComponent(id)}`,
        { signal },
      ),
    );
  }
  async milestoneChoices(signal?: AbortSignal) {
    const milestones = [];
    let offset = 0;
    for (;;) {
      const page = await this.milestones(
        { query: '', tag: '', milestone_id: '', limit: 100, offset },
        signal,
      );
      milestones.push(...page.data);
      if (
        !page.page.hasMore ||
        page.page.nextOffset === null ||
        page.page.nextOffset <= offset
      )
        break;
      offset = page.page.nextOffset;
    }
    return milestones;
  }
  async saveMilestone(input: MilestoneGuidanceInput, id?: string) {
    return MilestoneGuidanceSchema.parse(
      await this.api.request(
        `/admin/milestone-tools${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PUT' : 'POST',
          body: validateInput(MilestoneGuidanceInputSchema, input),
        },
      ),
    );
  }
  async hideMilestone(id: string) {
    await this.api.request(`/admin/milestone-tools/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async tips(
    scope: 'approved' | 'mine' | 'review',
    query: MilestoneAdminQuery,
    signal?: AbortSignal,
  ) {
    const suffix =
      scope === 'mine' ? '/mine' : scope === 'review' ? '/review-queue' : '';
    return milestoneAdminPageSchema(FamilyTipSchema).parse(
      await this.api.request(
        `/portal/tips${suffix}?${milestoneAdminQueryParams(query)}`,
        { signal },
      ),
    );
  }
  async tip(id: string, signal?: AbortSignal) {
    return FamilyTipSchema.parse(
      await this.api.request(`/portal/tips/${encodeURIComponent(id)}`, {
        signal,
      }),
    );
  }
  async saveTip(input: FamilyTipInput, id?: string) {
    return FamilyTipSchema.parse(
      await this.api.request(
        `/portal/tips${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PUT' : 'POST',
          body: id
            ? validateInput(FamilyTipUpdateSchema, { message: input.message })
            : validateInput(FamilyTipInputSchema, input),
        },
      ),
    );
  }
  async deleteTip(id: string) {
    await this.api.request(`/portal/tips/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async reviewTip(id: string, input: TipReviewInput) {
    return FamilyTipSchema.parse(
      await this.api.request(`/admin/tips/${encodeURIComponent(id)}/review`, {
        method: 'PATCH',
        body: validateInput(TipReviewInputSchema, input),
      }),
    );
  }
  async observations(query: MilestoneObservationQuery, signal?: AbortSignal) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== '') params.set(key, String(value));
    });
    return milestoneAdminPageSchema(MilestoneObservationSchema).parse(
      await this.api.request(`/portal/milestone-observations?${params}`, {
        signal,
      }),
    );
  }
  async saveObservation(input: MilestoneObservationInput, id?: string) {
    return MilestoneObservationSchema.parse(
      await this.api.request(
        `/portal/milestone-observations${id ? `/${encodeURIComponent(id)}` : ''}`,
        {
          method: id ? 'PUT' : 'POST',
          body: id
            ? validateInput(MilestoneObservationUpdateSchema, {
                response_option_id: input.response_option_id,
                observed_at: input.observed_at,
                notes: input.notes,
              })
            : validateInput(MilestoneObservationInputSchema, input),
        },
      ),
    );
  }
  async deleteObservation(id: string) {
    await this.api.request(
      `/portal/milestone-observations/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
  }
}
