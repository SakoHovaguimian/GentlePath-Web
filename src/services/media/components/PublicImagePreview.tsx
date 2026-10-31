'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UiIcon } from '@/components/ui';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { resolveDemoMediaUrl } from '@/services/demo/demoMedia';
import { strings } from '@/strings';

export function PublicImagePreview({ src }: { src: string }) {
  const { demoMode } = useRuntimeConfig();
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-video max-h-64 overflow-hidden rounded-xl border border-secondary bg-secondary_subtle">
      {failed ? (
        <div
          role="status"
          className="flex h-full items-center justify-center gap-3 p-4 text-sm text-secondary"
        >
          <UiIcon name="image" className="size-5 shrink-0" />
          {strings.media.previewUnavailable}
        </div>
      ) : (
        <Image
          unoptimized
          fill
          src={resolveDemoMediaUrl(src, demoMode)}
          alt={strings.media.imagePreviewAlt}
          sizes="(max-width: 640px) 90vw, 640px"
          className="object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
