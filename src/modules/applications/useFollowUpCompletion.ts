'use client';

import { useRef } from 'react';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathApplicationStrings as copy } from '@/strings';
import type { ApplicationFollowUp } from './models/applicationFollowUp';
import { useApplicationMutations } from './hooks';

export function useFollowUpCompletion(followUp?: ApplicationFollowUp) {
  const { completeFollowUp } = useApplicationMutations();
  const { showToast } = usePresentationService();
  const busy = useRef(false);
  async function complete() {
    if (!followUp || busy.current) return;
    busy.current = true;
    try {
      await completeFollowUp.mutateAsync({
        id: followUp.application_id,
        followUpId: followUp.id,
        input: {
          completed: !followUp.completed_at,
          expected_updated_at: followUp.updated_at!,
        },
      });
      void showToast({
        title: followUp.completed_at ? copy.reopenedTitle : copy.completedTitle,
        intent: 'success',
      });
    } catch {
      // Keep the current card or row available and expose the mutation error.
    } finally {
      busy.current = false;
    }
  }
  return { mutation: completeFollowUp, complete };
}
