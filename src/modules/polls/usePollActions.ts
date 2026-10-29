'use client';
import { useRef } from 'react';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathPollStrings as copy } from '@/strings';
import type { Poll } from './models/poll';
import { useDeletePoll } from './hooks';

export function usePollActions(onDeleted: () => void) {
  const mutation = useDeletePoll();
  const { showAlert, showToast } = usePresentationService();
  const { confirmNavigation } = useNavigationGuard();
  const busy = useRef(false);
  async function deletePoll(poll: Poll) {
    if (busy.current) return;
    busy.current = true;
    try {
      if (!(await confirmNavigation())) return;
      if (
        !(await showAlert({
          title: copy.deleteTitle,
          description: copy.deleteDescription(poll.title),
          tone: 'danger',
          confirmLabel: copy.deletePoll,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await mutation.mutateAsync(poll.id);
      void showToast({ title: copy.deleted, intent: 'success' });
      onDeleted();
    } catch {
      /* Inline recovery. */
    } finally {
      busy.current = false;
    }
  }
  return { deletePoll, error: mutation.error, isPending: mutation.isPending };
}
