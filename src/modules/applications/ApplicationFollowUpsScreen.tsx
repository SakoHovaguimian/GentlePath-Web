'use client';

import { useEffect } from 'react';

import {
  Button,
  Card,
  DirectoryPagination,
  EmptyState,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { gentlePathApplicationStrings as copy } from '@/strings';
import { usePriorityFollowUps } from './hooks';
import { FollowUpRow } from './components/FollowUpRow';
import '@/modules/portal/styles/portal.css';

export function ApplicationFollowUpsScreen() {
  const directory = usePortalDirectory();
  const query = usePriorityFollowUps(12, directory.offset);
  useEffect(() => {
    if (
      query.isSuccess &&
      !query.isFetching &&
      query.data.data.length === 0 &&
      directory.offset > 0
    ) {
      directory.setOffset(Math.max(0, directory.offset - 12));
    }
  }, [query.isSuccess, query.isFetching, query.data, directory]);
  return (
    <Page className="gp-portal-page">
      <PageHeader
        title={copy.priorityTitle}
        description={copy.priorityDescription}
        action={
          <Button asChild variant="secondary">
            <NavigationLink href="/applications">
              {copy.backAction}
            </NavigationLink>
          </Button>
        }
      />
      <QueryBoundary query={query}>
        {(result) => (
          <>
            {result.data.length ? (
              <Card>
                {result.data.map((followUp) => (
                  <FollowUpRow key={followUp.id} followUp={followUp} priority />
                ))}
              </Card>
            ) : (
              <EmptyState
                icon="file"
                title={copy.priorityEmptyTitle}
                description={copy.priorityEmptyHint}
              />
            )}
            <DirectoryPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              label={copy.priorityPaginationLabel}
              range={copy.rangeDescription}
              onNavigate={directory.setOffset}
            />
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
