'use client';
import { useEffect } from 'react';
import {
  Button,
  Card,
  DirectoryPagination,
  EmptyState,
  InlineLoading,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
  buttonClassName,
} from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import { useNotificationInbox, useNotificationCounts } from './hooks';
import { notificationInboxFilters } from './notificationInboxQueryParams';
import { useNotificationDirectory } from './useNotificationDirectory';
import { useNotificationActions } from './useNotificationActions';
import { NotificationRecord } from './components/NotificationRecord';
import { NotificationInboxToolbar } from './components/NotificationInboxToolbar';
import { NotificationInboxSummary } from './components/NotificationInboxSummary';

export function NotificationInboxScreen() {
  const directory = useNotificationDirectory();
  const query = useNotificationInbox(directory.query);
  const filters = notificationInboxFilters(directory.query);
  const counts = useNotificationCounts({
    query: filters.query,
    category: filters.category,
  });
  const filtered = Object.values(filters).some((value) => value !== undefined);
  const searched = Boolean(filters.query || filters.category);
  const actions = useNotificationActions(filters);
  const { confirmNavigation } = useNavigationGuard();
  useEffect(() => {
    if (
      query.isSuccess &&
      !query.isFetching &&
      query.data.data.length === 0 &&
      directory.query.offset > 0
    )
      directory.setOffset(0);
  }, [query.isSuccess, query.isFetching, query.data, directory]);
  return (
    <Page>
      <PageHeader
        title={copy.title}
        description={copy.description}
        meta={
          <NotificationInboxSummary
            counts={counts.data}
            unavailable={counts.isError}
            filtered={searched}
          />
        }
        action={
          <NavigationLink
            href="/settings/notifications"
            beforeNavigate={confirmNavigation}
            className={buttonClassName('secondary')}
          >
            <UiIcon name="settings" />
            {copy.settingsAction}
          </NavigationLink>
        }
      />
      <div className="grid min-w-0 gap-6">
        <NotificationInboxToolbar
          query={directory.query}
          counts={counts.isError ? undefined : counts.data}
          filtered={filtered}
          busy={actions.busy}
          hasNotifications={
            !query.isFetching && Boolean(query.data?.data.length)
          }
          update={directory.update}
          onReadAll={actions.readAll}
          onArchiveAll={actions.archiveAll}
        />
        <MutationError error={actions.error} />
        <section
          id="notification-results"
          aria-label={copy.resultsLabel}
          aria-busy={query.isFetching || actions.busy}
          className="relative grid min-w-0 gap-4"
        >
          <span
            aria-hidden="true"
            data-active={query.isFetching || actions.busy || undefined}
            className="ui-progress-line"
          />
          <span role="status" aria-live="polite" className="sr-only">
            {query.isFetching || actions.busy ? copy.loadingTitle : ''}
          </span>
          <QueryBoundary
            query={query}
            loadingFallback={
              <Card className="grid min-h-64 place-items-center">
                <InlineLoading message={copy.loadingTitle} />
              </Card>
            }
          >
            {(result) =>
              result.data.length ? (
                <ul className="m-0 grid min-w-0 list-none gap-4 p-0">
                  {result.data.map((item) => (
                    <li key={item.id} className="min-w-0">
                      <NotificationRecord
                        item={item}
                        busy={actions.busy}
                        onRead={actions.readItem}
                        onArchive={actions.archiveItem}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <Card>
                  <EmptyState
                    variant="plain"
                    title={filtered ? copy.noResultsTitle : copy.emptyTitle}
                    description={filtered ? copy.noResultsHint : copy.emptyHint}
                    action={
                      filtered && (
                        <Button
                          variant="secondary"
                          onClick={directory.clearFilters}
                        >
                          {copy.clearFiltersAction}
                        </Button>
                      )
                    }
                  />
                </Card>
              )
            }
          </QueryBoundary>
        </section>
        {query.data && (
          <div className="min-w-0 border-t border-secondary pt-4">
            <DirectoryPagination
              page={query.data.page}
              count={query.data.data.length}
              busy={query.isFetching || actions.busy}
              label={copy.paginationLabel}
              range={copy.rangeLabel}
              onNavigate={directory.setOffset}
            />
          </div>
        )}
      </div>
    </Page>
  );
}
