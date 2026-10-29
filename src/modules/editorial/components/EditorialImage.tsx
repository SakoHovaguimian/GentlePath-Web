'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Message } from '@/components/ui';
import { strings } from '@/strings';

export function EditorialImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Message title={strings.media.previewUnavailable} />;
  return (
    <div className="relative aspect-3/2 overflow-hidden rounded-xl border border-secondary bg-secondary_subtle">
      <Image
        unoptimized
        fill
        sizes="(max-width: 1023px) 100vw, 60vw"
        src={src}
        alt={alt}
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
