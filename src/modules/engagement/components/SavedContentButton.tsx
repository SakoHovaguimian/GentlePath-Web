'use client';
import { useRef, useState } from 'react';
import {
  BookmarkButton,
  Button,
  IconMenu,
  SuccessCelebration,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathEngagementStrings as copy } from '@/strings';
import type { SavedContentType } from '../models/savedContentType';
import type { IconMenuItem } from '@/components/ui/models/iconMenuItem';
import { useSavedContentState, useSetSavedContent } from '../hooks';
export function SavedContentButton({
  contentType,
  contentId,
  variant = 'primary',
  menuLabel,
  menuItems = [],
  onMenuAction,
}: {
  contentType: SavedContentType;
  contentId: string;
  variant?: 'primary' | 'ghost' | 'menu';
  menuLabel?: string;
  menuItems?: IconMenuItem<string>[];
  onMenuAction?: (id: string) => void;
}) {
  const query = useSavedContentState(contentType, contentId);
  const mutation = useSetSavedContent();
  const { showToast } = usePresentationService();
  const busy = useRef(false);
  const [celebration, celebrate] = useState(0);
  const saved = query.data?.saved ?? false;
  async function toggle() {
    if (busy.current || mutation.isPending || !query.data) return;
    busy.current = true;
    try {
      await mutation.mutateAsync({ contentType, contentId, saved: !saved });
      if (!saved) {
        celebrate((current) => current + 1);
        void showToast({ title: copy.savedTitle, intent: 'success' });
      }
    } catch {
      /* Inline recovery. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <div className="relative grid gap-2">
      {variant === 'menu' && <SuccessCelebration sequence={celebration} />}
      {variant === 'menu' ? (
        <IconMenu
          label={menuLabel ?? copy.actionsLabel(copy.types[contentType])}
          disabled={mutation.isPending}
          items={[
            ...menuItems,
            {
              id: 'save',
              label: saved ? copy.saved : copy.save,
              icon: 'bookmark',
              selected: saved,
              disabled: query.isPending || query.isError,
            },
          ]}
          onAction={(id) => {
            if (id === 'save') void toggle();
            else onMenuAction?.(id);
          }}
        />
      ) : (
        <BookmarkButton
          saved={saved}
          variant={variant}
          className={variant === 'ghost' ? 'px-2 py-2' : undefined}
          loading={query.isPending || mutation.isPending}
          disabled={query.isError}
          aria-pressed={saved}
          onClick={() => void toggle()}
        />
      )}
      {query.isError && (
        <Button variant="ghost" onClick={() => void query.refetch()}>
          {copy.retry}
        </Button>
      )}
      <MutationError error={query.error ?? mutation.error} />
    </div>
  );
}
