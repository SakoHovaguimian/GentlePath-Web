'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  DataPanel,
  DataTable,
  EmptyState,
  MobileRecordRow,
  Modal,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import styles from '@/modules/portal/Admin.module.css';
import {
  useHideMilestoneGuidance,
  useRestoreMilestoneGuidance,
  useMilestoneGuidance,
  useMilestoneGuidanceDetail,
  useMilestoneChoices,
} from './hooks';
import type { MilestoneGuidance } from './models/milestoneGuidance';
import { useMilestoneDirectory } from './useMilestoneDirectory';
import { formatMilestoneDate } from './formatMilestoneDate';
import { MilestoneDirectoryFilters } from './components/MilestoneDirectoryFilters';
import { MilestonePagination } from './components/MilestonePagination';
import { MilestoneGuidanceEditor } from './components/MilestoneGuidanceEditor';
interface ExistingMilestoneEditorProps {
  id: string;
  onClose: () => void;
}
function ExistingMilestoneEditor({
  id,
  onClose,
}: ExistingMilestoneEditorProps) {
  const query = useMilestoneGuidanceDetail(id, true);
  if (query.data)
    return <MilestoneGuidanceEditor milestone={query.data} onClose={onClose} />;
  return (
    <Modal open title={copy.editMilestone} onDismiss={onClose}>
      <QueryBoundary query={query} loadingMessage={copy.loadingMilestones}>
        {() => null}
      </QueryBoundary>
    </Modal>
  );
}
export function AdminMilestonesScreen() {
  const directory = useMilestoneDirectory();
  const query = useMilestoneGuidance(directory.query, true);
  const choices = useMilestoneChoices();
  const remove = useHideMilestoneGuidance();
  const params = useSearchParams();
  const editor = params.get('edit');
  const setEditor = (id: string | null) =>
    directory.update({ edit: id ?? undefined });
  const restore = useRestoreMilestoneGuidance();
  const [confirming, setConfirming] = useState(false);
  const busy = useRef(false);
  const { showAlert, showToast } = usePresentationService();
  useEffect(() => {
    if (
      query.data &&
      !query.data.data.length &&
      query.data.page.offset > 0 &&
      !query.isFetching
    )
      directory.update({
        offset: Math.max(0, query.data.page.offset - query.data.page.limit),
      });
  }, [query.data, query.isFetching, directory]);
  async function hide(milestone: MilestoneGuidance) {
    if (busy.current) return;
    busy.current = true;
    setConfirming(true);
    try {
      if (
        !(await showAlert({
          title: copy.hideMilestoneTitle,
          description: copy.hideMilestoneDescription(milestone.milestone),
          tone: 'danger',
          confirmLabel: copy.hideMilestone,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await remove.mutateAsync(milestone.id);
      void showToast({ title: copy.hiddenMilestone, intent: 'success' });
    } catch {
      /* The error stays next to the directory. */
    } finally {
      busy.current = false;
      setConfirming(false);
    }
  }
  async function bringBack(milestone: MilestoneGuidance) {
    if (busy.current) return;
    busy.current = true;
    try {
      await restore.mutateAsync(milestone.id);
      void showToast({ title: copy.restoredMilestone, intent: 'success' });
    } catch {
      /* Retain the record and show the mutation error. */
    } finally {
      busy.current = false;
    }
  }
  const filtered = Boolean(
    directory.query.query ||
    directory.query.tag ||
    directory.query.tags?.length,
  );
  const actions = (milestone: MilestoneGuidance) => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        disabled={remove.isPending || restore.isPending || confirming}
        onClick={() => setEditor(milestone.id)}
      >
        {copy.editMilestone}
      </Button>
      <Button
        variant={milestone.hidden ? 'secondary' : 'destructive'}
        disabled={remove.isPending || restore.isPending || confirming}
        onClick={() =>
          void (milestone.hidden ? bringBack(milestone) : hide(milestone))
        }
      >
        {milestone.hidden ? copy.restoreMilestone : copy.hideMilestone}
      </Button>
    </div>
  );
  return (
    <Page>
      <div className={styles.intro}>
        <PageHeader
          title={copy.milestonesTitle}
          description={copy.milestonesDescription}
          eyebrow={copy.milestonesEyebrow}
          action={
            <Button onClick={() => setEditor('new')}>
              <UiIcon name="plus" />
              {copy.newMilestone}
            </Button>
          }
        />
      </div>
      <MutationError error={remove.error ?? restore.error} />
      <DataPanel
        busy={query.isFetching}
        busyLabel={copy.loadingMilestones}
        toolbar={
          <MilestoneDirectoryFilters
            query={directory.query}
            tags={choices.data?.flatMap((milestone) => milestone.tags)}
            onChange={directory.update}
            multipleTags
            visibility
          />
        }
        footer={
          query.data && (
            <MilestonePagination
              page={query.data}
              busy={query.isFetching}
              onNavigate={(offset) => directory.update({ offset })}
            />
          )
        }
      >
        <QueryBoundary
          query={query}
          loadingMessage={copy.loadingMilestones}
          inset
        >
          {(page) =>
            page.data.length ? (
              <DataTable
                embedded
                caption={copy.milestoneCaption}
                rows={page.data}
                getRowKey={(item) => item.id}
                getRowHref={(item) => {
                  const next = new URLSearchParams(params.toString());
                  next.set('edit', item.id);
                  return `/admin/milestones?${next}`;
                }}
                onRowNavigate={(href) =>
                  setEditor(
                    new URL(href, window.location.origin).searchParams.get(
                      'edit',
                    ),
                  )
                }
                renderMobileRow={(item) => (
                  <MobileRecordRow
                    title={item.milestone}
                    description={item.tags.join(', ')}
                    summary={
                      <p className="m-0 text-xs text-tertiary">
                        {copy.optionsCount(item.response_options?.length ?? 0)}
                      </p>
                    }
                    footer={actions(item)}
                  />
                )}
                columns={[
                  {
                    key: 'milestone',
                    header: copy.milestoneLabel,
                    render: (item) => (
                      <div className="grid max-w-xl gap-2">
                        <Button
                          variant="ghost"
                          className="h-auto min-h-0 justify-start p-0 text-left font-medium"
                          onClick={() => setEditor(item.id)}
                        >
                          {item.milestone}
                        </Button>
                        {item.hidden && (
                          <Badge intent="neutral">
                            {copy.visibility.hidden}
                          </Badge>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag) => (
                            <Badge key={tag} intent="neutral">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'options',
                    header: copy.optionsTitle,
                    render: (item) =>
                      copy.optionsCount(item.response_options?.length ?? 0),
                  },
                  {
                    key: 'updated',
                    header: copy.updatedLabel,
                    render: (item) => (
                      <time dateTime={item.updated_at}>
                        {formatMilestoneDate(item.updated_at)}
                      </time>
                    ),
                  },
                  {
                    key: 'actions',
                    header: copy.guidanceTitle,
                    render: actions,
                  },
                ]}
              />
            ) : (
              <EmptyState
                variant="plain"
                icon="leaf"
                title={
                  filtered
                    ? copy.noResultsTitle
                    : directory.query.visibility === 'hidden'
                      ? copy.emptyHiddenTitle
                      : copy.emptyMilestonesTitle
                }
                description={
                  filtered
                    ? copy.noResultsDescription
                    : directory.query.visibility === 'hidden'
                      ? copy.emptyHiddenDescription
                      : copy.emptyMilestonesDescription
                }
                action={
                  <Button
                    variant={filtered ? 'secondary' : 'primary'}
                    onClick={() =>
                      filtered
                        ? directory.update({
                            query: '',
                            tag: '',
                            tags: undefined,
                            offset: 0,
                          })
                        : directory.query.visibility === 'hidden'
                          ? directory.update({
                              visibility: 'visible',
                              offset: 0,
                            })
                          : setEditor('new')
                    }
                  >
                    {filtered
                      ? copy.resetFilters
                      : directory.query.visibility === 'hidden'
                        ? copy.showVisibleMilestones
                        : copy.newMilestone}
                  </Button>
                }
              />
            )
          }
        </QueryBoundary>
      </DataPanel>
      {editor === 'new' ? (
        <MilestoneGuidanceEditor onClose={() => setEditor(null)} />
      ) : (
        editor && (
          <ExistingMilestoneEditor
            id={editor}
            onClose={() => setEditor(null)}
          />
        )
      )}
    </Page>
  );
}
