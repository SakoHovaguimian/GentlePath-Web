import 'server-only';
import {
  DomainError,
  NotFoundError,
  OwnershipError,
  ValidationError,
} from '@/errors/domainErrors';
import { gentlePathBlogStrings as copy } from '@/strings';
import {
  BlogMutationInputSchema,
  BlogRevisionInputSchema,
  type BlogArticle,
} from '@/modules/blog/models/blogArticle';
import { BlogQuerySchema } from '@/modules/blog/models/blogQuery';
import { getDemoBlogState } from './demoBlogState';

export interface DemoBlogActor {
  role: 'user' | 'admin' | 'superadmin';
  firstName?: string;
  lastName?: string;
}
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
export async function handleDemoBlogRequest(
  request: Request,
  path: string,
  actor: DemoBlogActor | null,
): Promise<Response> {
  const url = new URL(path, 'http://portal.internal');
  const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const isPublic = parts[0] === 'public';
  const [resource, id, action, ...rest] = isPublic ? parts.slice(1) : parts;
  if (resource !== 'blog' || rest.length)
    throw new NotFoundError(copy.missingArticle);
  if (isPublic && request.method !== 'GET')
    throw new OwnershipError(copy.permissionError);
  if (!isPublic && actor?.role !== 'admin' && actor?.role !== 'superadmin')
    throw new OwnershipError(copy.permissionError);
  const articles = getDemoBlogState();
  const input = () =>
    request.json().catch(() => {
      throw new ValidationError(copy.invalidInput);
    });
  const checkRevision = (
    article: BlogArticle,
    revision: number | undefined,
  ) => {
    if (article.revision !== revision)
      throw new DomainError(copy.conflictError, 'BLOG_CONFLICT', 409);
  };
  if (!id && request.method === 'GET') {
    const query = BlogQuerySchema.parse(Object.fromEntries(url.searchParams));
    const search = query.query.toLocaleLowerCase('en-US');
    const rows = articles
      .filter(
        (article) =>
          (!isPublic || article.status === 'published') &&
          (!query.category || article.category === query.category) &&
          (isPublic || !query.status || article.status === query.status) &&
          [
            article.title,
            article.description,
            article.author,
            copy.categories[article.category],
          ].some((value) => value.toLocaleLowerCase('en-US').includes(search)),
      )
      .sort(
        (a, b) =>
          Date.parse(isPublic ? b.publishedAt || b.updatedAt : b.updatedAt) -
          Date.parse(isPublic ? a.publishedAt || a.updatedAt : a.updatedAt),
      );
    const offset = rows.length
      ? Math.min(
          query.offset,
          Math.floor((rows.length - 1) / query.limit) * query.limit,
        )
      : 0;
    return json({
      data: rows.slice(offset, offset + query.limit),
      total: rows.length,
      offset,
      limit: query.limit,
    });
  }
  if (!isPublic && !id && request.method === 'POST') {
    const body = BlogMutationInputSchema.parse(await input());
    if (articles.some((article) => article.slug === body.slug))
      throw new ValidationError(copy.duplicateSlug);
    const now = new Date().toISOString();
    const article: BlogArticle = {
      ...body,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      status: 'draft',
      revision: 1,
    };
    articles.unshift(article);
    return json(article, 201);
  }
  const article = articles.find((item) =>
    isPublic ? item.slug === id && item.status === 'published' : item.id === id,
  );
  if (!article) throw new NotFoundError(copy.missingArticle);
  if (request.method === 'GET' && !action) return json(article);
  if (!isPublic && request.method === 'PATCH' && !action) {
    const body = BlogMutationInputSchema.parse(await input());
    checkRevision(article, body.revision);
    if (
      articles.some((item) => item.id !== article.id && item.slug === body.slug)
    )
      throw new ValidationError(copy.duplicateSlug);
    Object.assign(article, body, {
      updatedAt: new Date().toISOString(),
      revision: article.revision + 1,
    });
    return json(article);
  }
  if (
    !isPublic &&
    request.method === 'POST' &&
    (action === 'publish' || action === 'unpublish')
  ) {
    checkRevision(
      article,
      BlogRevisionInputSchema.parse(await input()).revision,
    );
    const now = new Date().toISOString();
    Object.assign(article, {
      status: action === 'publish' ? 'published' : 'draft',
      publishedAt: action === 'publish' ? now : null,
      updatedAt: now,
      revision: article.revision + 1,
    });
    return json(article);
  }
  if (!isPublic && request.method === 'DELETE' && !action) {
    checkRevision(
      article,
      BlogRevisionInputSchema.parse(await input()).revision,
    );
    articles.splice(articles.indexOf(article), 1);
    return new Response(null, {
      status: 204,
      headers: { 'cache-control': 'no-store' },
    });
  }
  throw new NotFoundError(copy.missingArticle);
}
