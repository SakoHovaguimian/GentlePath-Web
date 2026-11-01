'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  buttonClassName,
  Button,
  Card,
  IconMenu,
  Modal,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useChildren } from '@/modules/portal/hooks';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathGoalStrings as copy } from '@/strings';
import { useGoal, useGoalActions } from './hooks';
import type { Goal } from './models/goal';
import type { GoalMedia } from './models/goalMedia';
import type { GoalNote } from './models/goalNote';
import type { GoalStatus } from './models/goalStatus';
import { GoalStatusBadge } from './components/GoalStatusBadge';
import { GoalMediaPreview } from './components/GoalMediaPreview';
import { GoalNoteEditor } from './components/GoalNoteEditor';
import '@/modules/portal/styles/portal.css';
import { PrivateCommunityShareButton } from '@/modules/community/components/PrivateCommunityShareButton';
import { goalUnavailable } from './services/goalUnavailable';

export function GoalDetailScreen({ id }: { id: string }) {
  const query = useGoal(id);
  if (query.data && !goalUnavailable(query.error))
    return (
      <GoalDetail
        goal={query.data}
        refreshError={query.error}
        retry={() => void query.refetch()}
      />
    );
  return (
    <QueryBoundary query={query}>
      {(goal) => <GoalDetail goal={goal} />}
    </QueryBoundary>
  );
}
function GoalDetail({
  goal,
  refreshError,
  retry,
}: {
  goal: Goal;
  refreshError?: unknown;
  retry?: () => void;
}) {
  const actions = useGoalActions();
  const children = useChildren();
  const router = useRouter();
  const { showAlert, showToast } = usePresentationService();
  const busy = useRef(false);
  const [error, setError] = useState<unknown>(null);
  const [noteEditor, setNoteEditor] = useState<GoalNote | 'new' | null>(null);
  const [preview, setPreview] = useState<GoalMedia | null>(null);
  async function status(next: GoalStatus) {
    if (busy.current) return;
    busy.current = true;
    try {
      if (
        next === 'ARCHIVED' &&
        !(await showAlert({
          title: copy.archiveTitle,
          description: copy.archiveDescription,
          tone: 'danger',
          confirmLabel: copy.archive,
          cancelLabel: copy.keepActive,
        }))
      )
        return;
      await actions.status.mutateAsync({ id: goal.id, status: next });
      setError(null);
      void showToast({ title: copy.saved, intent: 'success' });
    } catch (failure) {
      setError(failure);
    } finally {
      busy.current = false;
    }
  }
  async function remove() {
    if (busy.current) return;
    busy.current = true;
    try {
      if (
        !(await showAlert({
          title: copy.deleteTitle,
          description: copy.deleteDescription,
          tone: 'danger',
          confirmLabel: copy.remove,
          cancelLabel: copy.keepGoal,
        }))
      )
        return;
      await actions.remove.mutateAsync(goal.id);
      void showToast({ title: copy.deleted, intent: 'success' });
      router.replace('/goals' as Route);
    } catch (failure) {
      setError(failure);
    } finally {
      busy.current = false;
    }
  }
  async function removeNote(note: GoalNote) {
    if (busy.current) return;
    busy.current = true;
    try {
      if (
        !(await showAlert({
          title: copy.deleteNoteTitle,
          description: copy.deleteNoteDescription,
          tone: 'danger',
          confirmLabel: copy.deleteNote,
          cancelLabel: copy.keepNote,
        }))
      )
        return;
      await actions.removeNote.mutateAsync({ id: goal.id, noteId: note.id });
      setError(null);
      void showToast({ title: copy.noteDeleted, intent: 'success' });
    } catch (failure) {
      setError(failure);
    } finally {
      busy.current = false;
    }
  }
  async function download(media: GoalMedia) {
    if (busy.current) return;
    busy.current = true;
    try {
      const result = await actions.download.mutateAsync({
        id: goal.id,
        mediaId: media.id,
      });
      const anchor = document.createElement('a');
      anchor.href = result.url;
      anchor.download = media.original_file_name;
      anchor.rel = ['noopener', 'noreferrer'].join(' ');
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setError(null);
    } catch (failure) {
      setError(failure);
    } finally {
      busy.current = false;
    }
  }
  return (
    <Page className="gp-portal-page">
      <NavigationLink
        href="/goals"
        className="text-sm font-semibold text-brand-secondary"
      >
        {copy.back}
      </NavigationLink>
      <PageHeader
        title={goal.title}
        description={copy.private}
        meta={
          <>
            <GoalStatusBadge status={goal.status} />
            <span>
              {children.data?.find((child) => child.id === goal.child_id)?.name}
            </span>
          </>
        }
        action={
          <NavigationLink
            href={`/goals/${goal.id}/edit`}
            className={buttonClassName()}
          >
            {copy.editGoal}
          </NavigationLink>
        }
      />
      <MutationError error={error || refreshError} />
      {Boolean(refreshError) && (
        <Button variant="secondary" onClick={retry}>
          {copy.retry}
        </Button>
      )}
      {goal.description && (
        <Card>
          <p className="m-0 whitespace-pre-wrap text-secondary">
            {goal.description}
          </p>
        </Card>
      )}
      <div className="flex flex-wrap gap-3">
        <PrivateCommunityShareButton childId={goal.child_id} />
        {goal.status !== 'COMPLETED' && (
          <Button
            loading={actions.status.isPending}
            onClick={() => void status('COMPLETED')}
          >
            {copy.complete}
          </Button>
        )}
        {goal.status !== 'ACTIVE' && (
          <Button
            variant="secondary"
            loading={actions.status.isPending}
            onClick={() => void status('ACTIVE')}
          >
            {copy.reopen}
          </Button>
        )}
        {goal.status !== 'ARCHIVED' && (
          <Button
            variant="destructive"
            disabled={actions.status.isPending}
            onClick={() => void status('ARCHIVED')}
          >
            {copy.archive}
          </Button>
        )}
        <Button
          variant="destructive"
          loading={actions.remove.isPending}
          onClick={() => void remove()}
        >
          {copy.remove}
        </Button>
      </div>
      {goal.media.length > 0 && (
        <section className="grid gap-4" aria-label={copy.attachments}>
          <h2 className="font-display text-2xl">{copy.attachments}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {goal.media.map((media) => (
              <Card key={media.id} className="grid gap-3">
                {media.mime_type.startsWith('image/') && (
                  <GoalMediaPreview goalId={goal.id} media={media} compact />
                )}
                <p className="m-0 wrap-break-word text-sm font-semibold">
                  {media.original_file_name}
                </p>
                <span className="text-xs text-tertiary">
                  {copy.fileSize(media.size_bytes)}
                </span>
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={() => setPreview(media)}>
                    {copy.preview}
                  </Button>
                  <Button
                    variant="secondary"
                    loading={actions.download.isPending}
                    onClick={() => void download(media)}
                  >
                    {copy.download}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
      <section className="grid gap-4" aria-label={copy.notes}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-display text-2xl">{copy.notes}</h2>
          <Button onClick={() => setNoteEditor('new')}>{copy.addNote}</Button>
        </div>
        {goal.notes.length === 0 ? (
          <p className="text-secondary">{copy.noNotes}</p>
        ) : (
          goal.notes.map((note) => (
            <Card key={note.id}>
              <div className="flex items-center justify-between gap-3">
                <time
                  dateTime={note.occurred_at}
                  className="text-sm text-tertiary"
                >
                  {new Date(note.occurred_at).toLocaleString('en-US')}
                </time>
                <IconMenu
                  label={copy.notes}
                  items={[
                    { id: 'edit', label: copy.editNote, icon: 'file' },
                    {
                      id: 'delete',
                      label: copy.deleteNote,
                      icon: 'trash',
                      variant: 'destructive',
                    },
                  ]}
                  disabled={actions.removeNote.isPending}
                  onAction={(action) =>
                    action === 'edit'
                      ? setNoteEditor(note)
                      : void removeNote(note)
                  }
                />
              </div>
              <p className="mb-0 whitespace-pre-wrap text-secondary">
                {note.message}
              </p>
            </Card>
          ))
        )}
      </section>
      {noteEditor && (
        <GoalNoteEditor
          goalId={goal.id}
          note={noteEditor === 'new' ? undefined : noteEditor}
          onClose={() => setNoteEditor(null)}
        />
      )}
      {preview && (
        <Modal
          open
          title={preview.original_file_name}
          onDismiss={() => setPreview(null)}
        >
          <GoalMediaPreview goalId={goal.id} media={preview} />
        </Modal>
      )}
    </Page>
  );
}
