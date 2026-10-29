import type { NextRequest } from 'next/server';
import { ValidationError } from '@/errors/domainErrors';
import { errorResponse } from '@/services/api/routeSafety';
import { gentlePathBlogStrings as copy } from '@/strings';
import { publicBlogService } from '@/modules/blog/services/publicBlogService';
import { BlogQuerySchema } from '@/modules/blog/models/blogQuery';

export const runtime = 'nodejs';
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const { path = [] } = await context.params;
    if (
      path.length > 1 ||
      path.some((part) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part))
    )
      throw new ValidationError(copy.invalidSlug);
    const result = path[0]
      ? await publicBlogService.getPublic(path[0])
      : await publicBlogService.listPublic(
          BlogQuerySchema.parse(
            Object.fromEntries(request.nextUrl.searchParams),
          ),
        );
    return Response.json(result, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
