'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  DirectoryFilters,
  EmptyState,
  IconTile,
  Page,
  PageHeader,
  QueryBoundary,
  RecordThumbnail,
  UiIcon,
} from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { useGuides } from './hooks';
import {
  editorialQueryParams,
  type EditorialQuery,
} from './models/editorialQuery';
import { EditorialPagination } from './components/EditorialPagination';

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
                  <Card key={guide.id} className="grid content-start gap-5">
                    <div className="flex items-start gap-4">
                      {guide.image_url ? (
                        <RecordThumbnail
                          src={guide.image_url}
                          alt={guide.title}
                        />
                      ) : (
                        <IconTile className="size-16">
                          <UiIcon name="leaf" className="size-7" />
                        </IconTile>
                      )}
                      <div className="grid min-w-0 gap-2">
                        <Badge intent="brand">
                          {copy.itemCount(guide.items.length)}
                        </Badge>
                        <h2 className="m-0 font-display text-xl font-normal text-primary wrap-anywhere">
                          <Link
                            className="hover:text-brand-secondary"
                            href={`/guides/${guide.id}`}
                          >
                            {guide.title}
                          </Link>
                        </h2>
                      </div>
                    </div>
                    <p className="m-0 text-sm text-secondary">
                      {guide.description}
                    </p>
                    <Button
                      asChild
                      variant="secondary"
                      className="justify-self-start"
                    >
                      <Link href={`/guides/${guide.id}`}>
                        {copy.openGuide}
                        <UiIcon name="arrowRight" />
                      </Link>
                    </Button>
                  </Card>
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
