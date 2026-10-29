import type { Metadata } from 'next';
import { gentlePathBlogStrings as copy } from '@/strings';
import { PublicBlogScreen } from '@/modules/blog/PublicBlogScreen';
import { publicBlogService } from '@/modules/blog/services/publicBlogService';
import { blogQueryFromSearch } from '@/modules/blog/models/blogQuery';

export const metadata: Metadata = {
  title: copy.publicMetadataTitle,
  description: copy.publicDescription,
};
export const dynamic = 'force-dynamic';
export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = blogQueryFromSearch(await searchParams);
  const page = await publicBlogService.listPublic(query);
  return (
    <PublicBlogScreen page={page} query={{ ...query, offset: page.offset }} />
  );
}
