'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  DataPanel,
  DataTable,
  EmptyState,
  MobileRecordRow,
  Page,
  PageHeader,
  QueryBoundary,
  RecordThumbnail,
  UiIcon,
} from '@/components/ui';
import {
  gentlePathBlogStrings as copy,
  gentlePathPortalStrings as portalCopy,
} from '@/strings';
import { useBlogArticles } from './hooks';
import { formatBlogDate } from './formatBlogDate';
import { BlogFilters } from './components/BlogFilters';
import { BlogPagination } from './components/BlogPagination';
import { blogQueryParams, type BlogQuery } from './models/blogQuery';
import type { BlogArticle } from './models/blogArticle';
import { blogCoverAssets } from './models/blogCover';
import styles from '../portal/Admin.module.css';

export function AdminBlogScreen({ query }: { query: BlogQuery }) {
  const router = useRouter();
  const articles = useBlogArticles(query);
  const navigate = (next: BlogQuery) =>
    router.replace(`/admin/blog?${blogQueryParams(next)}`, { scroll: false });
  const filtered = Boolean(query.query || query.category || query.status);
  const badge = (status: 'published' | 'draft') => (
    <Badge intent={status === 'published' ? 'success' : 'neutral'} dot>
      {copy.statuses[status]}
    </Badge>
  );
  const thumbnail = (article: BlogArticle) => (
    <span className={styles.articleThumbnail} data-cover={article.cover}>
      <RecordThumbnail
        src={blogCoverAssets[article.cover]}
        alt={copy.decorativeAlt}
      />
    </span>
  );
  return (
    <Page>
      <div className={styles.intro} data-tone="lilac">
        <PageHeader
          title={copy.adminTitle}
          description={copy.adminDescription}
          eyebrow={portalCopy.navigation.publishing}
          icon={
            <span className={styles.roundIcon} data-tone="lilac">
              <UiIcon name="file" />
            </span>
          }
          action={
            <Button asChild>
              <Link href="/admin/blog/new">
                <UiIcon name="plus" />
                {copy.newArticle}
              </Link>
            </Button>
          }
        />
      </div>
      <DataPanel
        className={styles.directoryPanel}
        toolbar={<BlogFilters admin query={query} onChangeAction={navigate} />}
        busy={articles.isFetching}
        busyLabel={copy.adminLoading}
        footer={
          articles.data ? (
            <BlogPagination
              page={articles.data}
              busy={articles.isFetching}
              onNavigateAction={(offset) => navigate({ ...query, offset })}
            />
          ) : undefined
        }
      >
        <QueryBoundary
          query={articles}
          loadingMessage={copy.adminLoading}
          inset
        >
          {(page) =>
            page.data.length ? (
              <DataTable
                embedded
                caption={copy.tableCaption}
                rows={page.data}
                getRowKey={(article) => article.id}
                getRowHref={(article) => `/admin/blog/${article.id}`}
                renderMobileRow={(article) => (
                  <MobileRecordRow
                    leading={thumbnail(article)}
                    title={
                      <Link href={`/admin/blog/${article.id}`}>
                        {article.title}
                      </Link>
                    }
                    description={copy.categories[article.category]}
                    summary={
                      <dl className="m-0 flex flex-wrap gap-x-2 gap-y-1 text-xs text-tertiary">
                        <dt>{copy.updatedColumn}</dt>
                        <dd className="m-0">
                          <time dateTime={article.updatedAt}>
                            {formatBlogDate(article.updatedAt)}
                          </time>
                        </dd>
                      </dl>
                    }
                    footer={
                      <div className="flex flex-wrap items-center gap-3">
                        {badge(article.status)}
                        <span>{article.author}</span>
                      </div>
                    }
                  />
                )}
                columns={[
                  {
                    key: 'title',
                    header: copy.titleColumn,
                    render: (article) => (
                      <div className={styles.articleIdentity}>
                        {thumbnail(article)}
                        <div className="grid gap-1">
                          <Link
                            className="font-medium text-primary hover:text-brand-secondary"
                            href={`/admin/blog/${article.id}`}
                          >
                            {article.title}
                          </Link>
                          <span className="text-xs text-tertiary">
                            {article.author}
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: copy.statusColumn,
                    render: (article) => badge(article.status),
                  },
                  {
                    key: 'category',
                    header: copy.topicColumn,
                    render: (article) => copy.categories[article.category],
                  },
                  {
                    key: 'updatedAt',
                    header: copy.updatedColumn,
                    render: (article) => (
                      <time dateTime={article.updatedAt}>
                        {formatBlogDate(article.updatedAt)}
                      </time>
                    ),
                  },
                ]}
              />
            ) : (
              <EmptyState
                variant="plain"
                title={
                  filtered ? copy.adminNoResultsTitle : copy.adminEmptyTitle
                }
                description={
                  filtered
                    ? copy.adminNoResultsDescription
                    : copy.adminEmptyDescription
                }
                action={
                  !filtered ? (
                    <Button asChild>
                      <Link href="/admin/blog/new">{copy.newArticle}</Link>
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate({ query: '', limit: 10, offset: 0 })
                      }
                    >
                      {copy.resetFilters}
                    </Button>
                  )
                }
              />
            )
          }
        </QueryBoundary>
      </DataPanel>
    </Page>
  );
}
