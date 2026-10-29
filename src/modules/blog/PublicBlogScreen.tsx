'use client';

import Image from 'next/image';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, EmptyState } from '@/components/ui';
import {
  gentlePathBlogStrings as copy,
  gentlePathLandingStrings,
} from '@/strings';
import type { BlogPage } from './models/blogPage';
import { blogQueryParams, type BlogQuery } from './models/blogQuery';
import { BlogArticleCard } from './components/BlogArticleCard';
import { BlogFilters } from './components/BlogFilters';
import { BlogPagination } from './components/BlogPagination';
import styles from './Blog.module.css';

export function PublicBlogScreen({
  page,
  query,
}: {
  page: BlogPage;
  query: BlogQuery;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigate = (next: BlogQuery) =>
    startTransition(() =>
      router.push(`/blog?${blogQueryParams({ ...next, status: undefined })}`, {
        scroll: false,
      }),
    );
  const filtered = Boolean(query.query || query.category);
  return (
    <main id="main-content" className={`gp-container ${styles.journal}`}>
      <header className={styles.journalHeader}>
        <div>
          <p className={styles.eyebrow}>{copy.publicEyebrow}</p>
          <h1>{copy.publicTitle}</h1>
          <p className={styles.heroDescription}>{copy.publicDescription}</p>
        </div>
      </header>
      <div className={styles.headerArtWrap}>
        <Image
          preload
          className={styles.headerArt}
          src="/gentlepath/path-landscape-v2.png"
          width={1536}
          height={1024}
          alt={gentlePathLandingStrings.hero.artAlt}
          sizes="(max-width: 600px) 94vw, 90vw"
        />
      </div>
      <section
        className={styles.articleSection}
        aria-label={copy.allArticles}
        aria-busy={isPending}
      >
        <div className={styles.filters}>
          <BlogFilters query={query} onChangeAction={navigate} />
        </div>
        {page.data.length ? (
          <div className={styles.articleGrid}>
            {page.data.map((article) => (
              <BlogArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <EmptyState
              title={filtered ? copy.noResultsTitle : copy.emptyTitle}
              description={
                filtered ? copy.noResultsDescription : copy.emptyDescription
              }
            />
            {filtered && (
              <Button
                variant="secondary"
                onClick={() => navigate({ query: '', limit: 6, offset: 0 })}
              >
                {copy.resetFilters}
              </Button>
            )}
          </div>
        )}
        <BlogPagination
          page={page}
          busy={isPending}
          onNavigateAction={(offset) => navigate({ ...query, offset })}
        />
      </section>
    </main>
  );
}
