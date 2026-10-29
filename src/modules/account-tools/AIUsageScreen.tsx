'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Badge,
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
  UiIcon,
} from '@/components/ui';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { MutationError } from '@/modules/portal/components/MutationError';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { useAIUsage, useDeleteAIUsage } from './hooks';
import type { AIUsageEvent } from './models/aiUsageEvent';
import {
  formatAccountToolsDate,
  formatTokenCount,
} from './formatAccountToolsDate';
import { AccountToolsLoading } from './components/AccountToolsLoading';
import { AccountToolsPagination } from './components/AccountToolsPagination';
import { AIUsageEditor } from './components/AIUsageEditor';
import { AIUsageDetailsDialog } from './components/AIUsageDetailsDialog';
import { AIUsageFilters } from './components/AIUsageFilters';

const deletedFilter = 'deleted';
export function AIUsageScreen() {
  const directory = usePortalDirectory();
  const params = useSearchParams();
  const extraFilters = {
    context: (params.get('context') ?? '').slice(0, 500),
    userId: params.get('userId') ?? '',
  };
  const query = useAIUsage({
    query: directory.query.slice(0, 200),
    deleted: directory.status === deletedFilter ? 'true' : 'false',
    context: extraFilters.context || undefined,
    userId: extraFilters.userId || undefined,
    limit: 20,
    offset: directory.offset,
  });
  const [editor, setEditor] = useState<AIUsageEvent | 'new' | null>(null);
  const [inspecting, setInspecting] = useState<AIUsageEvent | null>(null);
  const remove = useDeleteAIUsage();
  const busy = useRef(false);
  const presentation = usePresentationService();
  const filtered = Boolean(
    directory.query ||
    directory.status ||
    extraFilters.context ||
    extraFilters.userId,
  );
  const clear = () =>
    directory.update({
      query: undefined,
      status: undefined,
      context: undefined,
      userId: undefined,
      offset: undefined,
    });
  async function deleteRecord(record: AIUsageEvent) {
    if (busy.current) return;
    busy.current = true;
    try {
      if (
        !(await presentation.showAlert({
          title: copy.aiUsage.deleteTitle,
          description: copy.aiUsage.deleteDescription(record.context),
          tone: 'danger',
          confirmLabel: copy.aiUsage.deleteAction,
          cancelLabel: copy.common.cancelAction,
        }))
      )
        return;
      await remove.mutateAsync(record.id);
      if (query.data?.data.length === 1 && directory.offset)
        directory.setOffset(Math.max(0, directory.offset - 20));
      void presentation.showToast({
        title: copy.aiUsage.deletedTitle,
        intent: 'success',
      });
    } catch {
      /* Keep the active record and an inline recovery message. */
    } finally {
      busy.current = false;
    }
  }
  function actions(record: AIUsageEvent) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setInspecting(record)}>
          {copy.aiUsage.inspectAction}
        </Button>
        {!record.deleted && (
          <>
            <Button
              variant="ghost"
              disabled={remove.isPending}
              onClick={() => setEditor(record)}
            >
              {copy.common.editAction}
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => void deleteRecord(record)}
            >
              {copy.common.deleteAction}
            </Button>
          </>
        )}
      </div>
    );
  }
  return (
    <Page>
      <PageHeader
        title={copy.aiUsage.title}
        description={copy.aiUsage.description}
        eyebrow={copy.common.operationsEyebrow}
        action={
          <Button onClick={() => setEditor('new')}>
            <UiIcon name="plus" />
            {copy.aiUsage.newAction}
          </Button>
        }
      />
      <p className="m-0 text-sm text-secondary">{copy.aiUsage.accessHint}</p>
      <MutationError error={remove.error} />
      <DataPanel
        busy={query.isFetching}
        busyLabel={copy.common.loadingTitle}
        toolbar={
          <div className="grid gap-4">
            <DirectoryFilters
              id="ai-usage-search"
              value={{
                query: directory.query,
                status:
                  directory.status === deletedFilter
                    ? deletedFilter
                    : undefined,
              }}
              onChange={(value) =>
                directory.update({
                  query: value.query || undefined,
                  status: value.status,
                  offset: undefined,
                })
              }
              statuses={[
                { value: deletedFilter, label: copy.aiUsage.deletedOption },
              ]}
              copy={{
                search: copy.aiUsage.searchLabel,
                placeholder: copy.aiUsage.searchPlaceholder,
                clear: copy.common.clearAction,
                status: copy.common.statusLabel,
                allStatuses: copy.aiUsage.activeOption,
              }}
            />
            <AIUsageFilters
              key={JSON.stringify(extraFilters)}
              values={extraFilters}
              onChange={directory.update}
            />
          </div>
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
                caption={copy.aiUsage.title}
                rows={result.data}
                getRowKey={(record) => record.id}
                columns={[
                  {
                    key: 'context',
                    header: copy.aiUsage.contextLabel,
                    render: (record) => (
                      <span className="font-medium text-primary wrap-anywhere">
                        {record.context}
                      </span>
                    ),
                  },
                  {
                    key: 'user',
                    header: copy.aiUsage.userLabel,
                    render: (record) => (
                      <span className="font-mono text-xs wrap-anywhere">
                        {record.userId ?? copy.common.systemUser}
                      </span>
                    ),
                  },
                  {
                    key: 'tokens',
                    header: copy.aiUsage.totalLabel,
                    render: (record) => formatTokenCount(record.totalTokens),
                  },
                  {
                    key: 'created',
                    header: copy.common.createdColumn,
                    render: (record) =>
                      formatAccountToolsDate(record.createdAt),
                  },
                  {
                    key: 'actions',
                    header: copy.common.actionsColumn,
                    render: actions,
                  },
                ]}
                renderMobileRow={(record) => (
                  <MobileRecordRow
                    title={record.context}
                    description={record.userId ?? copy.common.systemUser}
                    summary={
                      <DescriptionList
                        items={[
                          {
                            label: copy.aiUsage.totalLabel,
                            value: formatTokenCount(record.totalTokens),
                          },
                          {
                            label: copy.common.createdColumn,
                            value: formatAccountToolsDate(record.createdAt),
                          },
                          {
                            label: copy.common.statusColumn,
                            value: (
                              <Badge>
                                {record.deleted
                                  ? copy.common.deletedStatus
                                  : copy.common.activeStatus}
                              </Badge>
                            ),
                          },
                        ]}
                      />
                    }
                    footer={actions(record)}
                  />
                )}
              />
            ) : (
              <EmptyState
                variant="plain"
                title={
                  filtered
                    ? copy.common.noResultsTitle
                    : copy.aiUsage.emptyTitle
                }
                description={
                  filtered ? copy.common.noResultsHint : copy.aiUsage.emptyHint
                }
                action={
                  <Button
                    variant="secondary"
                    onClick={() => (filtered ? clear() : setEditor('new'))}
                  >
                    {filtered
                      ? copy.common.clearFiltersAction
                      : copy.aiUsage.newAction}
                  </Button>
                }
              />
            )
          }
        </QueryBoundary>
      </DataPanel>
      {editor && (
        <AIUsageEditor
          key={editor === 'new' ? 'new' : editor.id}
          record={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(null)}
        />
      )}
      {inspecting && (
        <AIUsageDetailsDialog
          record={inspecting}
          onClose={() => setInspecting(null)}
        />
      )}
    </Page>
  );
}
