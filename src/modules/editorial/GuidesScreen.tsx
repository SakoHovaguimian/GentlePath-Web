'use client';

import { useRouter } from 'next/navigation';
import {
  Button,
  DirectoryFilters,
  EmptyState,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { useGuides } from './hooks';
import {
  editorialQueryParams,
  type EditorialQuery,
} from './models/editorialQuery';
import { EditorialPagination } from './components/EditorialPagination';
import { GuideCard } from './components/GuideCard';

export function GuidesScreen({ query }: { query: EditorialQuery }) {
  const guides = useGuides(query);
  const router = useRouter();
  const navigate = (next: EditorialQuery) =>
    router.push(`/guides?${editorialQueryParams(next)}`, { scroll: false });
  return (
    <Page>
      <PageHeader
        title={copy.guidesTitle}
        description={copy.guidesDescription}
        eyebrow={copy.guidesEyebrow}
      />
      <DirectoryFilters
        id="guides-search"
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
      <QueryBoundary query={guides} loadingMessage={copy.loadingLabel}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="grid gap-5 lg:grid-cols-2">
                {result.data.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  query.query ? copy.noResultsTitle : copy.emptyGuidesTitle
                }
                description={
                  query.query ? copy.noResultsHint : copy.emptyGuidesHint
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
                  ) : undefined
                }
              />
            )}
            <EditorialPagination
              page={result.page}
              count={result.data.length}
              busy={guides.isFetching}
              onNavigateAction={(offset) => navigate({ ...query, offset })}
            />
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
