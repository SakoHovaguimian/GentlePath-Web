import 'server-only';
import { ApiClient } from '@/services/api/apiClient';
import type {
  ApiClientInterface,
  ApiRequestOptions,
} from '@/services/api/apiClientInterface';
import { parseApiResponse } from '@/services/api/response';
import { NotFoundError } from '@/errors/domainErrors';
import { gentlePathBlogStrings as copy } from '@/strings';
import { handleDemoBlogRequest } from '@/services/demo/demoBlogApi';
import {
  getDemoContext,
  getEffectiveRuntime,
} from '@/services/demo/demoRuntime';
import { simulateDemoRequest } from '@/services/demo/demoSimulation';
import { BlogQuerySchema } from '../models/blogQuery';
import { BlogService } from './blogService';

class PublicBlogApiClient implements ApiClientInterface {
  private readonly api = new ApiClient();
  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    // Public reads deliberately never read or refresh a visitor session.
    if ((await getEffectiveRuntime()).demoMode) {
      const context = await getDemoContext();
      await simulateDemoRequest(context);
      if (context.scenario === 'empty') {
        const url = new URL(path, 'http://portal.internal');
        if (url.pathname !== '/public/blog')
          throw new NotFoundError(copy.missingArticle);
        const query = BlogQuerySchema.parse(
          Object.fromEntries(url.searchParams),
        );
        return { data: [], total: 0, limit: query.limit, offset: 0 } as T;
      }
      return parseApiResponse<T>(
        await handleDemoBlogRequest(
          new Request(`http://portal.internal${path}`),
          path,
          null,
        ),
      );
    }
    return this.api.request<T>(path, '', options);
  }
}
export const publicBlogService = new BlogService(new PublicBlogApiClient());
