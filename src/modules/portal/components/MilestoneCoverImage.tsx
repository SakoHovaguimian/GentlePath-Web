'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UiIcon } from '@/components/ui';
import { isPublicImageReference } from '@/models/publicImageUrl';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { resolveDemoMediaUrl } from '@/services/demo/demoMedia';
import { strings, gentlePathPortalStrings as copy } from '@/strings';

export function MilestoneCoverImage({ src }: { src: string }) {
  const { demoMode } = useRuntimeConfig();
  const [failed, setFailed] = useState(false);
  if (!isPublicImageReference(src)) return null;
  return (
    <div className="gp-milestone-card__image">
      {failed ? (
        <span
          className="flex h-full items-center justify-center text-tertiary"
          role="img"
          aria-label={strings.media.previewUnavailable}
        >
          <UiIcon name="image" className="size-8" />
        </span>
      ) : (
        <Image
          unoptimized
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1280px) 50vw, 640px"
          src={resolveDemoMediaUrl(src, demoMode)}
          alt={copy.common.decorativeAlt}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
