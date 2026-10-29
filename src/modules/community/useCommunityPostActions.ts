'use client';

import { useRef } from 'react';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathCommunityStrings as copy } from '@/strings';
import type { CommunityPost } from './models/communityPost';
import { useDeleteCommunityPost } from './hooks';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';

export function useCommunityPostActions(onDeleted?: () => void) {
  const mutation = useDeleteCommunityPost();
  const { showAlert, showToast } = usePresentationService();
  const { confirmNavigation } = useNavigationGuard();
  const busy = useRef(false);
  async function deletePost(post: CommunityPost) {
    if (busy.current) return;
    busy.current = true;
    try {
      if (!(await confirmNavigation())) return;
      if (
        !(await showAlert({
          title: copy.deletePostTitle,
          description: copy.deletePostDescription(post.title),
          tone: 'danger',
          confirmLabel: copy.deletePost,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await mutation.mutateAsync(post.id);
      void showToast({ title: copy.deletedPost, intent: 'success' });
      onDeleted?.();
    } catch {
      /* Inline recovery. */
    } finally {
      busy.current = false;
    }
  }
  return { deletePost, error: mutation.error, isPending: mutation.isPending };
}
