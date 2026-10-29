import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { PollInputSchema, PollSchema, type PollInput } from '../models/poll';
import { PollPageSchema } from '../models/pollPage';
import { PollCommentPageSchema } from '../models/pollCommentPage';
import {
  PollCommentInputSchema,
  PollCommentSchema,
  type PollCommentInput,
} from '../models/pollComment';
import { PollBallotInputSchema, PollBallotSchema } from '../models/pollBallot';
import { PollReactionSchema } from '../models/pollReaction';
import { PollStatusSchema } from '../models/pollStatus';
import {
  PollPagingSchema,
  PollQuerySchema,
  pollQueryParams,
  type PollPaging,
  type PollQuery,
} from '../models/pollQuery';

const root = '/portal/polls';

export class PollService {
  constructor(private readonly api: ApiClientInterface) {}
  async status(signal?: AbortSignal) {
    return PollStatusSchema.parse(
      await this.api.request(`${root}/status`, { signal }),
    );
  }
  async polls(query: PollQuery, signal?: AbortSignal) {
    const params = pollQueryParams(PollQuerySchema.parse(query));
    return PollPageSchema.parse(
      await this.api.request(`${root}?${params}`, { signal }),
    );
  }
  async poll(id: string, signal?: AbortSignal) {
    return PollSchema.parse(
      await this.api.request(`${root}/${encodeURIComponent(id)}`, { signal }),
    );
  }
  async savePoll(input: PollInput, id?: string) {
    return PollSchema.parse(
      await this.api.request(id ? `${root}/${encodeURIComponent(id)}` : root, {
        method: id ? 'PATCH' : 'POST',
        body: PollInputSchema.parse(input),
      }),
    );
  }
  deletePoll(id: string) {
    return this.api.request<void>(`${root}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
  async ballot(id: string, signal?: AbortSignal) {
    return PollBallotSchema.nullable().parse(
      await this.api.request(`${root}/${encodeURIComponent(id)}/ballot`, {
        signal,
      }),
    );
  }
  async vote(id: string, optionIds: string[]) {
    return PollBallotSchema.parse(
      await this.api.request(`${root}/${encodeURIComponent(id)}/ballot`, {
        method: 'PUT',
        body: PollBallotInputSchema.parse({ optionIds }),
      }),
    );
  }
  clearVote(id: string) {
    return this.api.request<void>(`${root}/${encodeURIComponent(id)}/ballot`, {
      method: 'DELETE',
    });
  }
  async comments(id: string, paging: PollPaging, signal?: AbortSignal) {
    return PollCommentPageSchema.parse(
      await this.api.request(
        `${root}/${encodeURIComponent(id)}/comments?${pollQueryParams(PollPagingSchema.parse(paging))}`,
        { signal },
      ),
    );
  }
  async saveComment(pollId: string, input: PollCommentInput, id?: string) {
    return PollCommentSchema.parse(
      await this.api.request(
        id
          ? `${root}/comments/${encodeURIComponent(id)}`
          : `${root}/${encodeURIComponent(pollId)}/comments`,
        {
          method: id ? 'PATCH' : 'POST',
          body: PollCommentInputSchema.parse(input),
        },
      ),
    );
  }
  deleteComment(id: string) {
    return this.api.request<void>(
      `${root}/comments/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
  }
  async react(id: string, liked: boolean) {
    return PollReactionSchema.parse(
      await this.api.request(
        `${root}/comments/${encodeURIComponent(id)}/reaction`,
        { method: 'POST', body: { liked } },
      ),
    );
  }
}
