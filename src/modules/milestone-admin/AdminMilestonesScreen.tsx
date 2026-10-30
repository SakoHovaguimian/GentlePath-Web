'use client';
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
  const query = useMilestoneGuidanceDetail(id);
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
  const query = useMilestoneGuidance(directory.query);
  const choices = useMilestoneChoices();
  const remove = useHideMilestoneGuidance();
  const [editor, setEditor] = useState<string | null>(null);
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
  const filtered = Boolean(directory.query.query || directory.query.tag);
  const actions = (milestone: MilestoneGuidance) => (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        disabled={remove.isPending || confirming}
        onClick={() => setEditor(milestone.id)}
      >
        {copy.editMilestone}
      </Button>
      <Button
        variant="destructive"
        disabled={remove.isPending || confirming}
        onClick={() => void hide(milestone)}
      >
        {copy.hideMilestone}
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
      <MutationError error={remove.error} />
      <DataPanel
        busy={query.isFetching}
        busyLabel={copy.loadingMilestones}
        toolbar={
          <MilestoneDirectoryFilters
            query={directory.query}
            tags={choices.data?.flatMap((milestone) => milestone.tags)}
            onChange={directory.update}
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
                        <span className="font-medium text-primary">
                          {item.milestone}
                        </span>
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
                  filtered ? copy.noResultsTitle : copy.emptyMilestonesTitle
                }
                description={
                  filtered
                    ? copy.noResultsDescription
                    : copy.emptyMilestonesDescription
                }
                action={
                  <Button
                    variant={filtered ? 'secondary' : 'primary'}
                    onClick={() =>
                      filtered
                        ? directory.update({ query: '', tag: '', offset: 0 })
                        : setEditor('new')
                    }
                  >
                    {filtered ? copy.resetFilters : copy.newMilestone}
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
