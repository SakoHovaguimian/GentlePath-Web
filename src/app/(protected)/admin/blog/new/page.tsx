import type { Metadata } from 'next';
import { gentlePathBlogStrings as copy } from '@/strings';
import { BlogEditorScreen } from '@/modules/blog/BlogEditorScreen';

export const metadata: Metadata = { title: copy.newTitle };
export default function NewBlogPage() {
  return <BlogEditorScreen />;
}
