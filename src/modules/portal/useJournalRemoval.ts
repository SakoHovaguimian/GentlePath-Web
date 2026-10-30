'use client';

import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useDeleteJournal } from './hooks';
import type { JournalEntry } from './models/journalEntry';

export function useJournalRemoval() {
  const mutation = useDeleteJournal();
  const { showAlert, showToast } = usePresentationService();

  async function deleteEntry(entry: JournalEntry) {
    if (
      !(await showAlert({
        title: copy.journal.deleteTitle,
        description: copy.journal.deleteDescription,
        tone: 'danger',
        confirmLabel: copy.journal.deleteAction,
        cancelLabel: copy.common.cancel,
      }))
    )
      return false;
    try {
      await mutation.mutateAsync(entry.id);
      void showToast({ title: copy.journal.deleted, intent: 'success' });
      return true;
    } catch {
      return false;
    }
  }

  return { mutation, deleteEntry };
}
