'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Button, InlineLoading } from '@/components/ui';
import { gentlePathGoalStrings as copy } from '@/strings';
import { useGoalMediaUrl } from '../hooks';
import type { GoalMedia } from '../models/goalMedia';
import { GoalCoverFallback } from './GoalCoverFallback';

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
  const [failedUrl, setFailedUrl] = useState<string>();
  if (url.isPending)
    return compact ? (
      <div className="aspect-video bg-secondary_subtle" />
    ) : (
      <InlineLoading message={copy.loading} />
    );
  if (url.isError)
    return compact ? (
      <GoalCoverFallback />
    ) : (
      <Button variant="secondary" onClick={() => void url.refetch()}>
        {copy.retry}
      </Button>
    );
  if (!url.data) return compact ? <GoalCoverFallback /> : null;
  const mediaUrl = url.data.url;
  if (compact && failedUrl === mediaUrl) return <GoalCoverFallback />;
  if (media.mime_type.startsWith('image/'))
    return (
      <Image
        unoptimized
        width={1200}
        height={750}
        src={url.data.url}
        alt={media.original_file_name}
        onError={() => setFailedUrl(mediaUrl)}
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
