import type { ApiClientInterface } from '@/services/api/apiClientInterface';
import { validateInput } from '@/utils/validateInput';
import { ApiError, NotFoundError } from '@/errors/domainErrors';
import { gentlePathBlogStrings as copy } from '@/strings';
import {
  BlogArticleSchema,
  BlogMutationInputSchema,
  BlogRevisionInputSchema,
  type BlogMutationInput,
} from '../models/blogArticle';
import { BlogPageSchema } from '../models/blogPage';
import {
  BlogQuerySchema,
  blogQueryParams,
  type BlogQuery,
} from '../models/blogQuery';

export class BlogService {
  constructor(private readonly api: ApiClientInterface) {}
  async list(query: BlogQuery, signal?: AbortSignal) {
    const params = blogQueryParams(validateInput(BlogQuerySchema, query));
    return BlogPageSchema.parse(
      await this.api.request<unknown>(`/blog?${params}`, { signal }),
    );
  }
  async get(id: string, signal?: AbortSignal) {
    return BlogArticleSchema.parse(
      await this.api.request<unknown>(`/blog/${encodeURIComponent(id)}`, {
        signal,
      }),
    );
  }
  async create(input: BlogMutationInput) {
    return BlogArticleSchema.parse(
      await this.api.request<unknown>('/blog', {
        method: 'POST',
        body: validateInput(BlogMutationInputSchema, input),
      }),
    );
  }
  async update(id: string, input: BlogMutationInput) {
    return BlogArticleSchema.parse(
      await this.api.request<unknown>(`/blog/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: validateInput(BlogMutationInputSchema, input),
      }),
    );
  }
  async setPublication(id: string, revision: number, published: boolean) {
    return BlogArticleSchema.parse(
      await this.api.request<unknown>(
        `/blog/${encodeURIComponent(id)}/${published ? 'publish' : 'unpublish'}`,
        {
          method: 'POST',
          body: validateInput(BlogRevisionInputSchema, { revision }),
        },
      ),
    );
  }
  async delete(id: string, revision: number) {
    await this.api.request<void>(`/blog/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: validateInput(BlogRevisionInputSchema, { revision }),
    });
  }
  async listPublic(query: BlogQuery, signal?: AbortSignal) {
    const validated = validateInput(BlogQuerySchema, query);
    const page = BlogPageSchema.parse(
      await this.api.request<unknown>(
        `/public/blog?${blogQueryParams({ ...validated, status: undefined })}`,
        { signal },
      ),
    );
    if (page.data.some((article) => article.status !== 'published'))
      throw new ApiError(copy.articleUnavailableDescription, 503);
    return page;
  }
  async getPublic(slug: string, signal?: AbortSignal) {
    const article = BlogArticleSchema.parse(
      await this.api.request<unknown>(
        `/public/blog/${encodeURIComponent(slug)}`,
        { signal },
      ),
    );
    if (article.status !== 'published')
      throw new NotFoundError(copy.missingArticle);
    return article;
  }
}
