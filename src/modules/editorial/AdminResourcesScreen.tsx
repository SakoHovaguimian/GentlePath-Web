'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
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
import { useEditorialResources } from './hooks';
import {
  editorialQueryParams,
  type EditorialQuery,
} from './models/editorialQuery';
import { EditorialResourceTypeSchema } from './models/resourceType';
import { EditorialPagination } from './components/EditorialPagination';
import { EditorialNav } from './components/EditorialNav';

export function AdminResourcesScreen({ query }: { query: EditorialQuery }) {
  const resources = useEditorialResources(query);
  const router = useRouter();
  const navigate = (next: EditorialQuery) =>
    router.push(`/admin/resources?${editorialQueryParams(next)}`, {
      scroll: false,
    });
  const filtered = Boolean(query.query || query.type || query.parent_id);
  return (
    <Page>
      <PageHeader
        title={copy.resourcesTitle}
        description={copy.resourcesDescription}
        action={
          <Button asChild>
            <Link href="/admin/resources/new">
              <UiIcon name="plus" />
              {copy.newResource}
            </Link>
          </Button>
        }
      />
      <EditorialNav active="resources" />
      {query.parent_id && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge intent="brand">{copy.childrenTitle}</Badge>
          <Button
            variant="secondary"
            onClick={() =>
              navigate({ ...query, parent_id: undefined, offset: 0 })
            }
          >
            {copy.allResources}
          </Button>
        </div>
      )}
      <DataPanel
        busy={resources.isFetching}
        busyLabel={copy.loadingLabel}
        toolbar={
          <DirectoryFilters
            id="admin-resources-search"
            value={{ query: query.query, status: query.type }}
            onChange={(value) =>
              navigate({
                ...query,
                query: value.query,
                type: value.status,
                offset: 0,
              })
            }
            statuses={EditorialResourceTypeSchema.options.map((value) => ({
              value,
              label: copy.types[value],
            }))}
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
          resources.data ? (
            <EditorialPagination
              page={resources.data.page}
              count={resources.data.data.length}
              busy={resources.isFetching}
              onNavigateAction={(offset) => navigate({ ...query, offset })}
            />
          ) : undefined
        }
      >
        <QueryBoundary inset query={resources}>
          {(result) =>
            result.data.length ? (
              <DataTable
                embedded
                caption={copy.resourceTableCaption}
                rows={result.data}
                getRowKey={(resource) => resource.id}
                getRowHref={(resource) => `/admin/resources/${resource.id}`}
                renderMobileRow={(resource) => (
                  <MobileRecordRow
                    title={
                      <Link href={`/admin/resources/${resource.id}`}>
                        {resource.title}
                      </Link>
                    }
                    description={
                      resource.resource_details.source_name ||
                      resource.description
                    }
                    footer={<Badge>{copy.types[resource.type]}</Badge>}
                  />
                )}
                columns={[
                  {
                    key: 'title',
                    header: copy.titleLabel,
                    render: (resource) => (
                      <div className="grid gap-1">
                        <Link
                          href={`/admin/resources/${resource.id}`}
                          className="font-medium text-primary hover:text-brand-secondary"
                        >
                          {resource.title}
                        </Link>
                        {resource.type === 'COLLECTION' && (
                          <span className="text-xs text-tertiary">
                            {copy.collectionChildCount(
                              resource.children_count ?? 0,
                            )}
                          </span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'type',
                    header: copy.typeColumn,
                    render: (resource) => (
                      <Badge>{copy.types[resource.type]}</Badge>
                    ),
                  },
                  {
                    key: 'source',
                    header: copy.sourceColumn,
                    render: (resource) =>
                      resource.resource_details.source_name ||
                      copy.types.COLLECTION,
                  },
                  {
                    key: 'updated',
                    header: copy.updatedColumn,
                    render: (resource) => (
                      <time dateTime={resource.updated_at}>
                        {formatBlogDate(resource.updated_at)}
                      </time>
                    ),
                  },
                ]}
              />
            ) : (
              <EmptyState
                variant="plain"
                title={
                  filtered ? copy.noResultsTitle : copy.emptyResourcesTitle
                }
                description={
                  filtered ? copy.noResultsHint : copy.emptyResourcesHint
                }
                action={
                  filtered ? (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate({ query: '', limit: query.limit, offset: 0 })
                      }
                    >
                      {copy.clearFilters}
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href="/admin/resources/new">
                        {copy.newResource}
                      </Link>
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
