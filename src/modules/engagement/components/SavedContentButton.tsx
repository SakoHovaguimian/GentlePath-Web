'use client';
import { Button, UiIcon } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathEngagementStrings as copy } from '@/strings';
import type { SavedContentType } from '../models/savedContentType';
import { useSavedContentState, useSetSavedContent } from '../hooks';
export function SavedContentButton({
  contentType,
  contentId,
  variant = 'primary',
}: {
  contentType: SavedContentType;
  contentId: string;
  variant?: 'primary' | 'ghost';
}) {
  const query = useSavedContentState(contentType, contentId);
  const mutation = useSetSavedContent();
  const { showToast } = usePresentationService();
  const saved = query.data?.saved ?? false;
  return (
    <div className="grid gap-2">
      <Button
        variant={saved ? 'destructive' : variant}
        className={variant === 'ghost' ? 'px-2 py-2' : undefined}
        loading={query.isPending || mutation.isPending}
        disabled={query.isError}
        aria-pressed={saved}
        onClick={async () => {
          if (mutation.isPending || !query.data) return;
          try {
            await mutation.mutateAsync({
              contentType,
              contentId,
              saved: !saved,
            });
            void showToast({
              title: saved ? copy.removedTitle : copy.savedTitle,
              intent: 'success',
            });
          } catch {
            /* Inline recovery. */
          }
        }}
      >
        <UiIcon name={saved ? 'trash' : 'pin'} className="size-4" />
        {saved ? copy.unsave : copy.save}
      </Button>
      {query.isError && (
        <Button variant="ghost" onClick={() => void query.refetch()}>
          {copy.retry}
        </Button>
      )}
      <MutationError error={query.error ?? mutation.error} />
    </div>
  );
}
