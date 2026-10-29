'use client';

import { useRef } from 'react';
import {
  Button,
  DataPanel,
  DataTable,
  DescriptionList,
  DirectoryFilters,
  EmptyState,
  MobileRecordRow,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import {
  AccountDeviceTypeSchema,
  type AccountDevice,
} from './models/accountDevice';
import { useAccountDevices, useRemoveAccountDevice } from './hooks';
import { AccountToolsLoading } from './components/AccountToolsLoading';
import { AccountToolsPagination } from './components/AccountToolsPagination';
import { formatAccountToolsDate } from './formatAccountToolsDate';

export function DevicesScreen() {
  const directory = usePortalDirectory();
  const deviceType = AccountDeviceTypeSchema.safeParse(directory.status);
  const query = useAccountDevices({
    query: directory.query.slice(0, 200),
    deviceType: deviceType.success ? deviceType.data : undefined,
    limit: 20,
    offset: directory.offset,
  });
  const remove = useRemoveAccountDevice();
  const busy = useRef(false);
  const presentation = usePresentationService();
  const filtered = Boolean(directory.query || directory.status);
  async function removeDevice(device: AccountDevice) {
    if (busy.current) return;
    busy.current = true;
    try {
      const confirmed = await presentation.showAlert({
        title: copy.devices.removeTitle,
        description: copy.devices.removeDescription(
          copy.devices.types[device.deviceType],
          formatAccountToolsDate(device.createdAt),
          device.id,
        ),
        tone: 'danger',
        confirmLabel: copy.devices.removeAction,
        cancelLabel: copy.common.cancelAction,
      });
      if (!confirmed) return;
      await remove.mutateAsync(device.id);
      if (query.data?.data.length === 1 && directory.offset)
        directory.setOffset(Math.max(0, directory.offset - 20));
      void presentation.showToast({
        title: copy.devices.removedTitle,
        intent: 'success',
      });
    } catch {
      /* The record and inline error remain available for retry. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Page>
      <PageHeader
        title={copy.devices.title}
        description={copy.devices.description}
        eyebrow={copy.common.accountEyebrow}
      />
      <MutationError error={remove.error} />
      <DataPanel
        busy={query.isFetching}
        busyLabel={copy.common.loadingTitle}
        toolbar={
          <DirectoryFilters
            id="devices-search"
            value={{
              query: directory.query,
              status: deviceType.success ? deviceType.data : undefined,
            }}
            onChange={(value) =>
              directory.update({
                query: value.query || undefined,
                status: value.status,
                offset: undefined,
              })
            }
            statuses={Object.entries(copy.devices.types).map(
              ([value, label]) => ({ value, label }),
            )}
            copy={{
              search: copy.devices.searchLabel,
              placeholder: copy.devices.searchPlaceholder,
              clear: copy.common.clearAction,
              status: copy.devices.typeLabel,
              allStatuses: copy.devices.allTypes,
            }}
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
                caption={copy.devices.title}
                rows={result.data}
                getRowKey={(device) => device.id}
                columns={[
                  {
                    key: 'type',
                    header: copy.devices.typeLabel,
                    render: (device) => (
                      <span className="grid gap-1">
                        <span className="font-medium text-primary">
                          {copy.devices.types[device.deviceType]}
                        </span>
                        <span className="font-mono text-xs text-tertiary wrap-anywhere">
                          {device.id}
                        </span>
                      </span>
                    ),
                  },
                  {
                    key: 'registered',
                    header: copy.devices.registeredColumn,
                    render: (device) =>
                      formatAccountToolsDate(device.createdAt),
                  },
                  {
                    key: 'updated',
                    header: copy.common.updatedColumn,
                    render: (device) =>
                      formatAccountToolsDate(device.updatedAt),
                  },
                  {
                    key: 'actions',
                    header: copy.common.actionsColumn,
                    render: (device) => (
                      <Button
                        variant="destructive"
                        disabled={remove.isPending}
                        onClick={() => void removeDevice(device)}
                      >
                        {copy.devices.removeAction}
                      </Button>
                    ),
                  },
                ]}
                renderMobileRow={(device) => (
                  <MobileRecordRow
                    title={copy.devices.types[device.deviceType]}
                    description={device.id}
                    summary={
                      <DescriptionList
                        items={[
                          {
                            label: copy.devices.registeredColumn,
                            value: formatAccountToolsDate(device.createdAt),
                          },
                          {
                            label: copy.common.updatedColumn,
                            value: formatAccountToolsDate(device.updatedAt),
                          },
                        ]}
                      />
                    }
                    footer={
                      <Button
                        variant="destructive"
                        disabled={remove.isPending}
                        onClick={() => void removeDevice(device)}
                      >
                        {copy.devices.removeAction}
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
                    : copy.devices.emptyTitle
                }
                description={
                  filtered ? copy.common.noResultsHint : copy.devices.emptyHint
                }
                action={
                  filtered && (
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
                      {copy.common.clearFiltersAction}
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
