import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import { SavedContentPageSchema } from '../models/savedContentPage';
import { SavedContentSchema } from '../models/savedContent';
import {
  SavedContentQuerySchema,
  type SavedContentQuery,
} from '../models/savedContentQuery';
import { SavedContentStateSchema } from '../models/savedContentState';
import type { SavedContentType } from '../models/savedContentType';
import {
  ResourceEngagementSchema,
  ResourceRatingInputSchema,
  type ResourceRatingInput,
} from '../models/resourceEngagement';
import { BlogEngagementSchema } from '../models/blogEngagement';
const base = '/portal/engagement';
export class EngagementService {
  constructor(private readonly api: ApiClientInterface) {}
  async savedContent(
    input: Partial<SavedContentQuery> = {},
    signal?: AbortSignal,
  ) {
    const query = SavedContentQuerySchema.parse(input);
    const params = new URLSearchParams({
      query: query.query,
      limit: String(query.limit),
      offset: String(query.offset),
    });
    if (query.contentType) params.set('contentType', query.contentType);
    return SavedContentPageSchema.parse(
      await this.api.request(`${base}/favorites?${params}`, { signal }),
    );
  }
  async savedItem(id: string, signal?: AbortSignal) {
    return SavedContentSchema.parse(
      await this.api.request(`${base}/favorites/${encodeURIComponent(id)}`, {
        signal,
      }),
    );
  }
  async savedState(type: SavedContentType, id: string, signal?: AbortSignal) {
    return SavedContentStateSchema.parse(
      await this.api.request(
        `${base}/favorites/${type}/${encodeURIComponent(id)}`,
        { signal },
      ),
    );
  }
  async setSaved(type: SavedContentType, id: string, saved: boolean) {
    return SavedContentStateSchema.parse(
      await this.api.request(
        `${base}/favorites/${type}/${encodeURIComponent(id)}`,
        { method: saved ? 'PUT' : 'DELETE' },
      ),
    );
  }
  async resource(id: string, signal?: AbortSignal) {
    return ResourceEngagementSchema.parse(
      await this.api.request(`${base}/resources/${encodeURIComponent(id)}`, {
        signal,
      }),
    );
  }
  async rateResource(id: string, input: ResourceRatingInput | null) {
    return ResourceEngagementSchema.parse(
      await this.api.request(
        `${base}/resources/${encodeURIComponent(id)}/rating`,
        {
          method: input ? 'PUT' : 'DELETE',
          ...(input
            ? { body: validateInput(ResourceRatingInputSchema, input) }
            : {}),
        },
      ),
    );
  }
  async blog(id: string, signal?: AbortSignal) {
    return BlogEngagementSchema.parse(
      await this.api.request(`${base}/blogs/${encodeURIComponent(id)}`, {
        signal,
      }),
    );
  }
  async likeBlog(id: string, liked: boolean) {
    return BlogEngagementSchema.parse(
      await this.api.request(`${base}/blogs/${encodeURIComponent(id)}/like`, {
        method: liked ? 'PUT' : 'DELETE',
      }),
    );
  }
}
