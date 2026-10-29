import type { Metadata } from 'next';
import { gentlePathBlogStrings as copy } from '@/strings';
import { BlogEditorScreen } from '@/modules/blog/BlogEditorScreen';

export const metadata: Metadata = { title: copy.editTitle };
export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <BlogEditorScreen articleId={(await params).id} />;
}
