'use client';
import Image from 'next/image';
import { Button, InlineLoading } from '@/components/ui';
import { gentlePathGoalStrings as copy } from '@/strings';
import { useGoalMediaUrl } from '../hooks';
import type { GoalMedia } from '../models/goalMedia';

export function GoalMediaPreview({
  goalId,
  media,
  compact = false,
}: {
  goalId: string;
  media: GoalMedia;
  compact?: boolean;
}) {
  const url = useGoalMediaUrl(goalId, media.id);
  if (url.isPending)
    return compact ? (
      <div className="aspect-video bg-secondary_subtle" />
    ) : (
      <InlineLoading message={copy.loading} />
    );
  if (url.isError)
    return compact ? null : (
      <Button variant="secondary" onClick={() => void url.refetch()}>
        {copy.retry}
      </Button>
    );
  if (!url.data) return null;
  if (media.mime_type.startsWith('image/'))
    return (
      <Image
        unoptimized
        width={1200}
        height={750}
        src={url.data.url}
        alt={media.original_file_name}
        className={
          compact
            ? 'aspect-video w-full object-cover'
            : 'max-h-[60vh] w-full object-contain'
        }
      />
    );
  if (media.mime_type.startsWith('video/'))
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={url.data.url}
        className="max-h-[60vh] w-full"
      />
    );
  return (
    <iframe
      src={url.data.url}
      title={media.original_file_name}
      className="h-[60vh] w-full rounded-lg border border-secondary"
    />
  );
}
