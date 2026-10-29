'use client';
import Link from 'next/link';
import type { Route } from 'next';
import { Badge, Button, Card, UiIcon } from '@/components/ui';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { MutationError } from '@/modules/portal/components/MutationError';
import { usePresentationService } from '@/presentation/PresentationProvider';
import type { SavedContent } from '../models/savedContent';
import { useSetSavedContent } from '../hooks';
export function SavedContentCard({ item }: { item: SavedContent }) {
  const mutation = useSetSavedContent();
  const { showToast } = usePresentationService();
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{copy.types[item.contentType]}</Badge>
        {!item.target && (
          <Badge intent="warning">{copy.unavailableTitle}</Badge>
        )}
      </div>
      <div className="grid gap-2">
        <h2 className="m-0 font-display text-xl text-primary">
          {item.target?.title || copy.untitled}
        </h2>
        <p className="m-0 text-sm whitespace-pre-wrap wrap-anywhere text-secondary">
          {item.target?.preview || copy.unavailableDescription}
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {item.target && (
          <Button variant="secondary" asChild>
            <Link
              href={
                (item.target.readerPath ??
                  `/saved/${encodeURIComponent(item.id)}`) as Route
              }
            >
              {item.target.readerPath ? copy.read : copy.readPreview}
              <UiIcon name="arrowRight" className="size-4" />
            </Link>
          </Button>
        )}
        <Button
          variant="destructive"
          loading={mutation.isPending}
          onClick={async () => {
            try {
              await mutation.mutateAsync({
                contentType: item.contentType,
                contentId: item.contentId,
                saved: false,
              });
              void showToast({ title: copy.removedTitle, intent: 'success' });
            } catch {
              /* Inline recovery. */
            }
          }}
        >
          <UiIcon name="close" className="size-4" />
          {copy.unsave}
        </Button>
      </div>
      <MutationError error={mutation.error} />
    </Card>
  );
}
