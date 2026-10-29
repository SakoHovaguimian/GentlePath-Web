'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  DataPanel,
  DataTable,
  DirectoryFilters,
  EmptyState,
  MobileRecordRow,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { formatBlogDate } from '@/modules/blog/formatBlogDate';
import { useGuides } from './hooks';
import {
  editorialQueryParams,
  type EditorialQuery,
} from './models/editorialQuery';
import { EditorialPagination } from './components/EditorialPagination';
import { EditorialNav } from './components/EditorialNav';

export function AdminGuidesScreen({ query }: { query: EditorialQuery }) {
  const guides = useGuides(query);
  const router = useRouter();
  const navigate = (next: EditorialQuery) =>
    router.push(`/admin/guides?${editorialQueryParams(next)}`, {
      scroll: false,
    });
  return (
    <Page>
      <PageHeader
        title={copy.adminGuidesTitle}
        description={copy.adminGuidesDescription}
        action={
          <Button asChild>
            <Link href="/admin/guides/new">
              <UiIcon name="plus" />
              {copy.newGuide}
            </Link>
          </Button>
        }
      />
      <EditorialNav active="guides" />
      <DataPanel
        busy={guides.isFetching}
        busyLabel={copy.loadingLabel}
        toolbar={
          <DirectoryFilters
            id="admin-guides-search"
            value={{ query: query.query }}
            onChange={(value) =>
              navigate({ ...query, query: value.query, offset: 0 })
            }
            statuses={[]}
            showStatus={false}
            copy={{
              search: copy.searchLabel,
              placeholder: copy.searchPlaceholder,
              clear: copy.clearSearch,
              status: copy.typeLabel,
              allStatuses: copy.allTypes,
            }}
          />
        }
        footer={
          guides.data ? (
            <EditorialPagination
              page={guides.data.page}
              count={guides.data.data.length}
              busy={guides.isFetching}
              onNavigateAction={(offset) => navigate({ ...query, offset })}
            />
          ) : undefined
        }
      >
        <QueryBoundary inset query={guides}>
          {(result) =>
            result.data.length ? (
              <DataTable
                embedded
                caption={copy.guideTableCaption}
                rows={result.data}
                getRowKey={(guide) => guide.id}
                getRowHref={(guide) => `/admin/guides/${guide.id}`}
                renderMobileRow={(guide) => (
                  <MobileRecordRow
                    title={
                      <Link href={`/admin/guides/${guide.id}`}>
                        {guide.title}
                      </Link>
                    }
                    description={guide.description}
                    footer={copy.itemCount(guide.items.length)}
                  />
                )}
                columns={[
                  {
                    key: 'title',
                    header: copy.titleLabel,
                    render: (guide) => (
                      <Link
                        href={`/admin/guides/${guide.id}`}
                        className="font-medium text-primary hover:text-brand-secondary"
                      >
                        {guide.title}
                      </Link>
                    ),
                  },
                  {
                    key: 'steps',
                    header: copy.stepsColumn,
                    render: (guide) => copy.itemCount(guide.items.length),
                  },
                  {
                    key: 'updated',
                    header: copy.updatedColumn,
                    render: (guide) => (
                      <time dateTime={guide.updated_at}>
                        {formatBlogDate(guide.updated_at)}
                      </time>
                    ),
                  },
                ]}
              />
            ) : (
              <EmptyState
                variant="plain"
                title={
                  query.query ? copy.noResultsTitle : copy.emptyAdminGuidesTitle
                }
                description={
                  query.query ? copy.noResultsHint : copy.emptyAdminGuidesHint
                }
                action={
                  query.query ? (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate({ ...query, query: '', offset: 0 })
                      }
                    >
                      {copy.clearFilters}
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/admin/guides/new">{copy.newGuide}</Link>
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
