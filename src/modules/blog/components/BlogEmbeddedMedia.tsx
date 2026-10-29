'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { resolveBlogEmbed } from '../content/resolveBlogEmbed';
import type { BlogEmbedContent } from '../models/blogEmbedContent';
import styles from '../Blog.module.css';

export function BlogEmbeddedMedia({
  metaData,
}: {
  metaData: BlogEmbedContent['metaData'];
}) {
  const player = resolveBlogEmbed(metaData.url);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const loaded = Boolean(player && activeSource === player.src);
  return (
    <figure className={styles.contentEmbed}>
      <div className={styles.contentEmbedCard}>
        <span className={styles.contentEmbedHost}>
          {new URL(metaData.url).hostname}
        </span>
        <strong>{metaData.title}</strong>
        {player && (
          <p className={styles.contentEmbedHint}>
            {copy.embedConnectionHint(copy.embedProviders[player.provider])}
          </p>
        )}
        <div className={styles.contentEmbedActions}>
          {player && (
            <Button
              variant="secondary"
              aria-expanded={loaded}
              onClick={() => setActiveSource(loaded ? null : player.src)}
            >
              {loaded ? copy.unloadEmbed : copy.loadEmbed}
            </Button>
          )}
          <Button asChild variant="ghost">
            <a
              href={metaData.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.openEmbed}
            </a>
          </Button>
        </div>
        {loaded && player && (
          <iframe
            className={styles.contentEmbedFrame}
            data-provider={player.provider}
            src={player.src}
            title={metaData.title}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allow="encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      {metaData.caption && <figcaption>{metaData.caption}</figcaption>}
    </figure>
  );
}
