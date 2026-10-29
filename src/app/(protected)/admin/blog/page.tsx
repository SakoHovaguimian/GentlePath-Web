import type { Metadata } from 'next';
import { gentlePathBlogStrings as copy } from '@/strings';
import { AdminBlogScreen } from '@/modules/blog/AdminBlogScreen';
import { blogQueryFromSearch } from '@/modules/blog/models/blogQuery';

export const metadata: Metadata = { title: copy.adminTitle };
export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <AdminBlogScreen query={blogQueryFromSearch(await searchParams, 10)} />
  );
}
