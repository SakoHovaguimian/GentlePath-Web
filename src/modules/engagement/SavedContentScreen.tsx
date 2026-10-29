'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Button,
  DirectoryFilters,
  DirectoryPagination,
  EmptyState,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { SavedContentTypeSchema } from './models/savedContentType';
import { useSavedContent } from './hooks';
import { SavedContentCard } from './components/SavedContentCard';
import '@/modules/portal/styles/portal.css';
export function SavedContentScreen() {
  const directory = usePortalDirectory();
  const parsed = SavedContentTypeSchema.safeParse(directory.status);
  const contentType = parsed.success ? parsed.data : undefined;
  const query = useSavedContent({
    query: directory.query.slice(0, 200),
    contentType,
    limit: 12,
    offset: directory.offset,
  });
  useEffect(() => {
    if (
      query.data &&
      !query.data.data.length &&
      directory.offset > 0 &&
      !query.isFetching
    )
      directory.setOffset(Math.max(0, directory.offset - 12));
  }, [query.data, query.isFetching, directory]);
  const filtered = Boolean(directory.query || contentType);
  return (
    <Page className="gp-portal-page">
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          <Button asChild variant="secondary">
            <Link href="/resources">
              {copy.explore}
              <UiIcon name="arrowRight" className="size-4" />
            </Link>
          </Button>
        }
      />
      <DirectoryFilters
        id="saved-content-search"
        value={{ query: directory.query, status: contentType }}
        onChange={(value) =>
          directory.update({
            query: value.query,
            status: value.status,
            offset: undefined,
          })
        }
        statuses={SavedContentTypeSchema.options.map((value) => ({
          value,
          label: copy.types[value],
        }))}
        copy={{
          search: copy.searchLabel,
          placeholder: copy.searchPlaceholder,
          clear: copy.clear,
          status: copy.typeLabel,
          allStatuses: copy.allTypes,
        }}
      />
      <QueryBoundary query={query}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {result.data.map((item) => (
                  <SavedContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="pin"
                title={filtered ? copy.noResultsTitle : copy.emptyTitle}
                description={
                  filtered ? copy.noResultsDescription : copy.emptyDescription
                }
                action={
                  filtered ? (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        directory.update({
                          query: undefined,
                          status: undefined,
                          offset: undefined,
                        })
                      }
                    >
                      {copy.clear}
                    </Button>
                  ) : (
                    <Button asChild variant="secondary">
                      <Link href="/resources">{copy.explore}</Link>
                    </Button>
                  )
                }
              />
            )}
            <DirectoryPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              label={copy.paginationLabel}
              range={copy.rangeDescription}
              onNavigate={directory.setOffset}
            />
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
