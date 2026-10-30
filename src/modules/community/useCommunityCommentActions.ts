'use client';

import { useRef } from 'react';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityComment } from './models/communityComment';
import { useDeleteCommunityComment } from './hooks';

export function useCommunityCommentActions(
  onDeleted?: (comment: CommunityComment) => void,
) {
  const mutation = useDeleteCommunityComment();
  const { showAlert, showToast } = usePresentationService();
  const busy = useRef(false);

  async function deleteComment(comment: CommunityComment) {
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
      void showToast({ title: copy.deletedComment, intent: 'success' });
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
