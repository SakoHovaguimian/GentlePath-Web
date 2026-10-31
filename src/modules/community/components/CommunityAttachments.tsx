'use client';

import Image from 'next/image';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { resolveDemoMediaUrl } from '@/services/demo/demoMedia';
import { useState } from 'react';
import { BlogEmbeddedMedia } from '@/modules/blog/components/BlogEmbeddedMedia';
import { resolveBlogEmbed } from '@/modules/blog/content/resolveBlogEmbed';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathCommunityStrings as copy } from '@/strings';
import {
  CommunityAttachmentSchema,
  type CommunityAttachment,
} from '../models/communityAttachment';

function CommunityAttachmentPreview({ item }: { item: CommunityAttachment }) {
  const { demoMode } = useRuntimeConfig();
  const mediaUrl = resolveDemoMediaUrl(item.url, demoMode);
  const [failed, setFailed] = useState(false);
  // Validate again at the rendering boundary before loading any remote resource.
  if (!CommunityAttachmentSchema.safeParse(item).success) return null;
  const player = item.kind === 'VIDEO' ? resolveBlogEmbed(item.url) : null;
  if (player && player.provider !== 'spotify')
    return (
      <div className="gp-community-provider-media">
        <BlogEmbeddedMedia
          metaData={{ url: item.url, title: item.description }}
        />
      </div>
    );
  return (
    <figure
      className={`gp-community-attachment gp-community-attachment--${item.kind.toLowerCase()}`}
    >
      {item.kind === 'IMAGE' && !failed && (
        <a
          className="gp-community-attachment__image"
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
        >
          <Image
            src={mediaUrl}
            alt={item.description}
            fill
            unoptimized
            sizes="(max-width: 640px) 90vw, 440px"
            className="object-contain"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        </a>
      )}
      {item.kind === 'VIDEO' && !failed && (
        <video
          className="gp-community-attachment__video"
          src={mediaUrl}
          controls
          playsInline
          preload="none"
          aria-label={item.description}
          onError={() => setFailed(true)}
        />
      )}
      <figcaption className="gp-community-attachment__caption">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-primary wrap-anywhere">
            {item.description}
          </span>
          <span className="block text-xs text-tertiary wrap-anywhere">
            {failed
              ? copy.unavailableMediaHint
              : mediaUrl !== item.url
                ? copy.illustrationSource
                : new URL(item.url).hostname}
          </span>
        </span>
        <Button asChild variant="ghost" className="shrink-0 px-2">
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            aria-label={copy.openAttachmentDescription(item.description)}
          >
            <UiIcon name="link" className="size-4" />
            <span className="sr-only">{copy.openAttachment}</span>
          </a>
        </Button>
      </figcaption>
    </figure>
  );
}

export function CommunityAttachments({
  items,
}: {
  items: CommunityAttachment[];
}) {
  if (!items.length) return null;
  return (
    <div className="gp-community-attachments">
      {items.map((item, index) => (
        <CommunityAttachmentPreview key={`${index}:${item.url}`} item={item} />
      ))}
    </div>
  );
}
