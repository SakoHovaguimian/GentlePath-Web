'use client';

import { useBlogArticle } from './hooks';
import { Page, QueryBoundary } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
import { BlogEditor } from './components/BlogEditor';

export function BlogEditorScreen({ articleId }: { articleId?: string }) {
  const article = useBlogArticle(articleId);
  if (!articleId) return <BlogEditor />;
  return (
    <Page>
      <QueryBoundary query={article} loadingMessage={copy.adminLoading}>
        {(data) => <BlogEditor key={data.id} initialArticle={data} />}
      </QueryBoundary>
    </Page>
  );
}
