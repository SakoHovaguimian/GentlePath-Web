import 'server-only';
import { z } from 'zod';
import {
  ApiError,
  NotFoundError,
  ValidationError,
} from '@/errors/domainErrors';
import type { BackendForward } from '@/services/api/models/backendForward';
import { getDemoBlogState } from '@/services/demo/demoBlogState';
import {
  CommercialAppRouteSchema,
  commercialWebRoute,
} from '../models/commercialDestination';
import { gentlePathCommercialStrings as copy } from '@/strings';
const PublishedBlogDestinationSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  status: z.literal('published'),
});
export async function commercialDestination(
  params: URLSearchParams,
  demo: boolean,
  request?: Request,
  forward?: BackendForward,
) {
  if (Array.from(params.keys()).some((key) => key !== 'route'))
    throw new ValidationError();
  const parsed = CommercialAppRouteSchema.safeParse(params.get('route'));
  if (!parsed.success) throw new ValidationError(copy.validation.action);
  const route = parsed.data;
  const blogId = route.startsWith('/blogs/') ? route.split('/')[2] : undefined;
  if (!blogId) return { href: commercialWebRoute(route) };
  // Mobile blog actions use UUIDs; the web reader uses published slugs.
  if (demo) {
    const article = getDemoBlogState().find(
      (item) => item.id === blogId && item.status === 'published',
    );
    if (!article) throw new NotFoundError(copy.validation.notFound);
    return { href: `/blog/${encodeURIComponent(article.slug)}` };
  }
  if (!forward || !request) throw new ApiError();
  const response = await forward(
    request,
    `/public/blog/id/${encodeURIComponent(blogId)}`,
  );
  if (response.status === 404)
    throw new NotFoundError(copy.validation.notFound);
  if (!response.ok) throw new ApiError();
  const article = PublishedBlogDestinationSchema.parse(await response.json());
  return { href: `/blog/${encodeURIComponent(article.slug)}` };
}
