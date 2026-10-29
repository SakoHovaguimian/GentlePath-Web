'use client';

import { useSearchParams } from 'next/navigation';
import {
  Button,
  DataPanel,
  DataTable,
  DescriptionList,
  EmptyState,
  MobileRecordRow,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { DeliveryStatusSchema } from './models/notificationDelivery';
import { useNotificationDeliveries } from './hooks';
import { formatAccountToolsDate } from './formatAccountToolsDate';
import { AccountToolsLoading } from './components/AccountToolsLoading';
import { AccountToolsPagination } from './components/AccountToolsPagination';
import {
  DeliveryFilters,
  deliveryDateBoundary,
} from './components/DeliveryFilters';
import { DeliveryStatusBadge } from './components/DeliveryStatusBadge';
import { DeliveryAttemptsDialog } from './components/DeliveryAttemptsDialog';

export function DeliveryHistoryScreen() {
  const directory = usePortalDirectory();
  const params = useSearchParams();
  const status = DeliveryStatusSchema.safeParse(directory.status);
  const filters = {
    status: status.success ? status.data : '',
    notification: params.get('notification') ?? '',
    after: params.get('after') ?? '',
    before: params.get('before') ?? '',
  };
  const query = useNotificationDeliveries({
    status: status.success ? status.data : undefined,
    notificationId: filters.notification || undefined,
    createdAfter: deliveryDateBoundary(filters.after),
    createdBefore: deliveryDateBoundary(filters.before),
    limit: 20,
    offset: directory.offset,
  });
  const selected = query.data?.data.find(
    (delivery) => delivery.id === params.get('delivery'),
  );
  const attemptOffset = Number(params.get('attemptOffset') ?? 0);
  const filtered = Object.values(filters).some(Boolean);
  const clear = () =>
    directory.update({
      status: undefined,
      notification: undefined,
      after: undefined,
      before: undefined,
      offset: undefined,
    });
  return (
    <Page>
      <PageHeader
        title={copy.deliveries.title}
        description={copy.deliveries.description}
        eyebrow={copy.common.operationsEyebrow}
      />
      <p className="m-0 text-sm text-secondary">{copy.deliveries.accessHint}</p>
      <DataPanel
        busy={query.isFetching}
        busyLabel={copy.common.loadingTitle}
        toolbar={
          <DeliveryFilters
            key={JSON.stringify(filters)}
            values={filters}
            onChange={directory.update}
          />
        }
        footer={
          query.data && (
            <AccountToolsPagination
              page={query.data.page}
              count={query.data.data.length}
              busy={query.isFetching}
              onNavigate={directory.setOffset}
            />
          )
        }
      >
        <QueryBoundary
          query={query}
          loadingFallback={<AccountToolsLoading />}
          inset
        >
          {(result) =>
            result.data.length ? (
              <DataTable
                embedded
                caption={copy.deliveries.title}
                rows={result.data}
                getRowKey={(delivery) => delivery.id}
                columns={[
                  {
                    key: 'notification',
                    header: copy.deliveries.notificationColumn,
                    render: (delivery) => (
                      <span className="font-mono text-xs wrap-anywhere">
                        {delivery.notificationId}
                      </span>
                    ),
                  },
                  {
                    key: 'channel',
                    header: copy.deliveries.channelColumn,
                    render: (delivery) =>
                      copy.deliveries.channels[delivery.channel],
                  },
                  {
                    key: 'status',
                    header: copy.common.statusColumn,
                    render: (delivery) => (
                      <DeliveryStatusBadge status={delivery.status} />
                    ),
                  },
                  {
                    key: 'attempts',
                    header: copy.deliveries.attemptsColumn,
                    render: (delivery) => delivery.attemptCount,
                  },
                  {
                    key: 'created',
                    header: copy.common.createdColumn,
                    render: (delivery) =>
                      formatAccountToolsDate(delivery.createdAt),
                  },
                  {
                    key: 'actions',
                    header: copy.common.actionsColumn,
                    render: (delivery) => (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          directory.update({
                            delivery: delivery.id,
                            attemptOffset: undefined,
                          })
                        }
                      >
                        {copy.deliveries.inspectAction}
                      </Button>
                    ),
                  },
                ]}
                renderMobileRow={(delivery) => (
                  <MobileRecordRow
                    title={copy.deliveries.channels[delivery.channel]}
                    description={delivery.notificationId}
                    summary={
                      <DescriptionList
                        items={[
                          {
                            label: copy.common.statusColumn,
                            value: (
                              <DeliveryStatusBadge status={delivery.status} />
                            ),
                          },
                          {
                            label: copy.deliveries.attemptsColumn,
                            value: delivery.attemptCount,
                          },
                          {
                            label: copy.common.createdColumn,
                            value: formatAccountToolsDate(delivery.createdAt),
                          },
                        ]}
                      />
                    }
                    footer={
                      <Button
                        variant="secondary"
                        onClick={() =>
                          directory.update({
                            delivery: delivery.id,
                            attemptOffset: undefined,
                          })
                        }
                      >
                        {copy.deliveries.inspectAction}
                      </Button>
                    }
                  />
                )}
              />
            ) : (
              <EmptyState
                variant="plain"
                title={
                  filtered
                    ? copy.common.noResultsTitle
                    : copy.deliveries.emptyTitle
                }
                description={
                  filtered
                    ? copy.common.noResultsHint
                    : copy.deliveries.emptyHint
                }
                action={
                  filtered && (
                    <Button variant="secondary" onClick={clear}>
                      {copy.common.clearFiltersAction}
                    </Button>
                  )
                }
              />
            )
          }
        </QueryBoundary>
      </DataPanel>
      {selected && (
        <DeliveryAttemptsDialog
          delivery={selected}
          offset={
            Number.isSafeInteger(attemptOffset) && attemptOffset > 0
              ? attemptOffset
              : 0
          }
          onNavigate={(offset) =>
            directory.update({
              attemptOffset: offset ? String(offset) : undefined,
            })
          }
          onClose={() =>
            directory.update({ delivery: undefined, attemptOffset: undefined })
          }
        />
      )}
    </Page>
  );
}
