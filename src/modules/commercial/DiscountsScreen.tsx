'use client';
import { useEffect } from 'react';
import {
  Button,
  DirectoryFilters,
  DirectoryPagination,
  EmptyState,
  Message,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { useDiscountOffers } from './hooks';
import { OfferCard } from './components/OfferCard';
import { CommercialServing } from './components/CommercialServing';
export function DiscountsScreen() {
  const directory = usePortalDirectory();
  const query = useDiscountOffers({
    query: directory.query,
    category: directory.status || undefined,
    offset: directory.offset,
  });
  useEffect(() => {
    if (
      query.data &&
      !query.data.data.length &&
      query.data.page.offset > 0 &&
      !query.isFetching
    )
      directory.setOffset(
        Math.max(0, query.data.page.offset - query.data.page.limit),
      );
  }, [query.data, query.isFetching, directory]);
  return (
    <Page>
      <PageHeader
        title={copy.discountsTitle}
        description={copy.discountsDescription}
      />
      <Message
        title={copy.sponsored}
        description={copy.privacyHint}
        intent="neutral"
      />
      {!directory.query && !directory.status && directory.offset === 0 && (
        <CommercialServing placementKey="FAMILY_DISCOUNTS_CAROUSEL" />
      )}
      <DirectoryFilters
        id="discount-search"
        value={{
          query: directory.query,
          status: directory.status || undefined,
        }}
        onChange={(value) =>
          directory.update({
            query: value.query,
            status: value.status,
            offset: undefined,
          })
        }
        statuses={Object.entries(copy.categories).map(([value, label]) => ({
          value,
          label,
        }))}
        copy={{
          search: copy.search,
          placeholder: copy.searchPlaceholder,
          clear: copy.clear,
          status: copy.category,
          allStatuses: copy.allCategories,
        }}
      />
      <QueryBoundary query={query}>
        {(page) => (
          <>
            {page.data.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {page.data.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={copy.emptyTitle}
                description={copy.discountsEmptyHint}
                action={
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
                }
              />
            )}
            <DirectoryPagination
              page={page.page}
              count={page.data.length}
              busy={query.isFetching}
              label={copy.pagination}
              range={copy.range}
              onNavigate={directory.setOffset}
            />
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
