'use client';

import { useRef } from 'react';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPollStrings as copy } from '@/strings';
import type { PollComment } from './models/pollComment';
import { useDeletePollComment } from './hooks';

export function usePollCommentActions(
  onDeleted?: (comment: PollComment) => void,
) {
  const mutation = useDeletePollComment();
  const { showAlert, showToast } = usePresentationService();
  const busy = useRef(false);

  async function deleteComment(comment: PollComment) {
    if (busy.current) return false;
    busy.current = true;
    try {
      if (
        !(await showAlert({
          title: copy.deleteCommentTitle,
          description: copy.deleteCommentDescription,
          tone: 'danger',
          confirmLabel: copy.deleteComment,
          cancelLabel: copy.cancel,
        }))
      )
        return false;
      await mutation.mutateAsync(comment.id);
      void showToast({ title: copy.commentDeleted, intent: 'success' });
      onDeleted?.(comment);
      return true;
    } catch {
      return false;
    } finally {
      busy.current = false;
    }
  }

  return {
    deleteComment,
    error: mutation.error,
    isPending: mutation.isPending,
  };
}
