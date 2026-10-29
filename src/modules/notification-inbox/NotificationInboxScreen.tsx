'use client';
import { useEffect } from 'react';
import {
  Badge,
  Button,
  buttonClassName,
  DataPanel,
  DataPanelState,
  DirectoryPagination,
  EmptyState,
  InlineLoading,
  Page,
  PageHeader,
  QueryBoundary,
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
import { NotificationDirectoryFilters } from './components/NotificationDirectoryFilters';

export function NotificationInboxScreen() {
  const directory = useNotificationDirectory();
  const query = useNotificationInbox(directory.query);
  const filters = notificationInboxFilters(directory.query);
  const counts = useNotificationCounts({
    query: filters.query,
    category: filters.category,
  });
  const filtered = Object.values(filters).some((value) => value !== undefined);
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
        eyebrow={copy.eyebrow}
        meta={
          counts.data ? (
            <>
              <Badge intent="brand">
                {copy.unreadCount(counts.data.unreadCount)}
              </Badge>
              <span>{copy.totalCount(counts.data.totalCount)}</span>
            </>
          ) : counts.isError ? (
            <span role="status">{copy.countUnavailable}</span>
          ) : undefined
        }
        action={
          <NavigationLink
            href="/settings/notifications"
            beforeNavigate={confirmNavigation}
            className={buttonClassName('secondary')}
          >
            {copy.settingsAction}
          </NavigationLink>
        }
      />
      <MutationError error={actions.error} />
      <DataPanel
        busy={query.isFetching || actions.busy}
        busyLabel={copy.loadingTitle}
        toolbar={
          <div className="grid gap-4">
            <NotificationDirectoryFilters
              query={directory.query}
              update={directory.update}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                disabled={
                  actions.busy || query.isFetching || !query.data?.data.length
                }
                onClick={() => actions.readAll(true)}
              >
                {filtered
                  ? copy.markMatchingReadAction
                  : copy.markAllReadAction}
              </Button>
              <Button
                variant="secondary"
                disabled={
                  actions.busy || query.isFetching || !query.data?.data.length
                }
                onClick={() => actions.readAll(false)}
              >
                {filtered
                  ? copy.markMatchingUnreadAction
                  : copy.markAllUnreadAction}
              </Button>
              <Button
                variant="ghost"
                disabled={
                  actions.busy || query.isFetching || !query.data?.data.length
                }
                onClick={actions.archiveAll}
              >
                {filtered ? copy.archiveMatchingAction : copy.archiveAllAction}
              </Button>
            </div>
            <p className="m-0 text-xs text-tertiary">
              {filtered ? copy.scopeFilteredHint : copy.scopeAllHint}
            </p>
          </div>
        }
        footer={
          query.data && (
            <DirectoryPagination
              page={query.data.page}
              count={query.data.data.length}
              busy={query.isFetching || actions.busy}
              label={copy.paginationLabel}
              range={copy.rangeLabel}
              onNavigate={directory.setOffset}
            />
          )
        }
      >
        <QueryBoundary
          query={query}
          loadingFallback={
            <DataPanelState>
              <InlineLoading message={copy.loadingTitle} />
            </DataPanelState>
          }
          inset
        >
          {(result) =>
            result.data.length ? (
              <div className="divide-y divide-secondary">
                {result.data.map((item) => (
                  <NotificationRecord
                    key={item.id}
                    item={item}
                    busy={actions.busy}
                    onRead={actions.readItem}
                    onArchive={actions.archiveItem}
                  />
                ))}
              </div>
            ) : (
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
            )
          }
        </QueryBoundary>
      </DataPanel>
    </Page>
  );
}
