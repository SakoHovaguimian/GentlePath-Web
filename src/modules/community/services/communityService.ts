import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import {
  CommunityPostInputSchema,
  CommunityPostSchema,
  type CommunityPostInput,
} from '../models/communityPost';
import {
  CommunityCommentInputSchema,
  CommunityCommentUpdateInputSchema,
  CommunityCommentSchema,
  type CommunityCommentInput,
} from '../models/communityComment';
import {
  CommunityReportInputSchema,
  CommunityReportSchema,
  type CommunityReportInput,
} from '../models/communityReport';
import {
  CommunityReactionInputSchema,
  CommunityReactionSchema,
} from '../models/communityReaction';
import { CommunityCommentPageSchema } from '../models/communityCommentPage';
import { CommunityPostPageSchema } from '../models/communityPostPage';
import { CommunityReportPageSchema } from '../models/communityReportPage';
import {
  CommunityCommentQuerySchema,
  type CommunityCommentQuery,
} from '../models/communityCommentQuery';
import {
  CommunityPostQuerySchema,
  type CommunityPostQuery,
} from '../models/communityPostQuery';
import {
  CommunityReportQuerySchema,
  type CommunityReportQuery,
} from '../models/communityReportQuery';
import { communityQueryParams } from '../communityQueryParams';
import { CommunityStatusSchema } from '../models/communityStatus';

const base = '/portal/community';
const postPath = (id: string) => `${base}/posts/${encodeURIComponent(id)}`;
const commentPath = (id: string) =>
  `${base}/comments/${encodeURIComponent(id)}`;

export class CommunityService {
  constructor(private readonly api: ApiClientInterface) {}

  async status(signal?: AbortSignal) {
    return CommunityStatusSchema.parse(
      await this.api.request(`${base}/status`, { signal }),
    );
  }
  async posts(query: CommunityPostQuery, signal?: AbortSignal) {
    const params = communityQueryParams(
      validateInput(CommunityPostQuerySchema, query),
    );
    return CommunityPostPageSchema.parse(
      await this.api.request(`${base}/posts?${params}`, { signal }),
    );
  }
  async post(id: string, signal?: AbortSignal) {
    return CommunityPostSchema.parse(
      await this.api.request(postPath(id), { signal }),
    );
  }
  async savePost(input: CommunityPostInput, id?: string) {
    return CommunityPostSchema.parse(
      await this.api.request(id ? postPath(id) : `${base}/posts`, {
        method: id ? 'PATCH' : 'POST',
        body: validateInput(CommunityPostInputSchema, input),
      }),
    );
  }
  async deletePost(id: string) {
    await this.api.request(postPath(id), { method: 'DELETE' });
  }
  async comments(
    postId: string,
    paging: CommunityCommentQuery,
    signal?: AbortSignal,
  ) {
    const params = communityQueryParams(
      validateInput(CommunityCommentQuerySchema, paging),
    );
    return CommunityCommentPageSchema.parse(
      await this.api.request(`${postPath(postId)}/comments?${params}`, {
        signal,
      }),
    );
  }
  async saveComment(postId: string, input: CommunityCommentInput, id?: string) {
    return CommunityCommentSchema.parse(
      await this.api.request(
        id ? commentPath(id) : `${postPath(postId)}/comments`,
        {
          method: id ? 'PATCH' : 'POST',
          body: validateInput(
            id
              ? CommunityCommentUpdateInputSchema
              : CommunityCommentInputSchema,
            input,
          ),
        },
      ),
    );
  }
  async deleteComment(id: string) {
    await this.api.request(commentPath(id), { method: 'DELETE' });
  }
  async react(targetType: 'post' | 'post_comment', id: string, liked: boolean) {
    return CommunityReactionSchema.parse(
      await this.api.request(
        `${targetType === 'post' ? postPath(id) : commentPath(id)}/reaction`,
        {
          method: 'POST',
          body: validateInput(CommunityReactionInputSchema, { liked }),
        },
      ),
    );
  }
  async reports(query: CommunityReportQuery, signal?: AbortSignal) {
    const params = communityQueryParams(
      validateInput(CommunityReportQuerySchema, query),
    );
    return CommunityReportPageSchema.parse(
      await this.api.request(`${base}/reports?${params}`, { signal }),
    );
  }
  async report(input: CommunityReportInput) {
    return CommunityReportSchema.parse(
      await this.api.request(`${base}/reports`, {
        method: 'POST',
        body: validateInput(CommunityReportInputSchema, input),
      }),
    );
  }
}
