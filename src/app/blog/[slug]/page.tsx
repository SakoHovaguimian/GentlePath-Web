import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
import { publicBlogService } from '@/modules/blog/services/publicBlogService';
import { BlogArticleReader } from '@/modules/blog/components/BlogArticleReader';
import { BlogArticleCard } from '@/modules/blog/components/BlogArticleCard';
import styles from '@/modules/blog/Blog.module.css';

export const dynamic = 'force-dynamic';
const readArticle = cache(async (slug: string) => {
  try {
    return await publicBlogService.getPublic(slug);
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      error.status === 404
    )
      notFound();
    throw error;
  }
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = await readArticle((await params).slug);
  return { title: article.title, description: article.description };
}
export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const article = await readArticle((await params).slug);
  const related = await publicBlogService.listPublic({
    category: article.category,
    query: '',
    limit: 4,
    offset: 0,
  });
  const nextArticles = related.data
    .filter((item) => item.id !== article.id)
    .slice(0, 3);
  return (
    <main id="main-content" className="gp-container">
      <div className={styles.readerNavigation}>
        <Button asChild variant="ghost">
          <Link href="/blog">
            <UiIcon name="chevronLeft" />
            {copy.backToJournal}
          </Link>
        </Button>
      </div>
      <BlogArticleReader article={article} />
      {nextArticles.length > 0 && (
        <section className={styles.related}>
          <h2>{copy.relatedTitle}</h2>
          <div className={styles.articleGrid}>
            {nextArticles.map((item) => (
              <BlogArticleCard key={item.id} article={item} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
