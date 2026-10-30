'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useSessionState } from '@/providers/AppProviders';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityFeedPreferenceService } from './services/communityFeedPreferenceService';

const emptySnapshot = () => '';

export function useCommunityFeedPreference() {
  const { session } = useSessionState();
  const { demoMode } = useRuntimeConfig();
  const service = useMemo(
    () => new CommunityFeedPreferenceService(session?.user.id ?? '', demoMode),
    [session?.user.id, demoMode],
  );
  const snapshot = useSyncExternalStore(
    service.subscribe,
    service.readSnapshot,
    emptySnapshot,
  );
  const hiddenPostIds = useMemo(
    () => service.hiddenPostIds(snapshot),
    [service, snapshot],
  );
  const [error, setError] = useState('');
  const { showToast } = usePresentationService();

  function restore(postId?: string) {
    try {
      if (postId) service.setHidden(postId, false);
      else service.clear();
      setError('');
    } catch {
      setError(copy.hideErrorDescription);
    }
  }

  function hide(postId: string) {
    if (!session) return false;
    try {
      service.setHidden(postId, true);
      setError('');
      void showToast({
        title: copy.postHidden,
        description: copy.postHiddenDescription,
        intent: 'success',
        actionLabel: copy.undoHide,
        onAction: () => restore(postId),
      });
      return true;
    } catch {
      setError(copy.hideErrorDescription);
      return false;
    }
  }

  return { hiddenPostIds, hide, restore, error };
}
