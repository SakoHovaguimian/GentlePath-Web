'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UiIcon } from '@/components/ui';
import { gentlePathStateBenefitsStrings as copy } from '@/strings';
import type { StateBenefitProgram } from '../models/stateBenefitProgram';

const artwork = {
  HEALTHCARE: '/gentlepath/caregiver-community.png',
  EARLY_SUPPORT: '/gentlepath/growing-together-v2.png',
  FAMILY_SUPPORT: '/gentlepath/family-connection.png',
} as const;
export function StateBenefitImage({
  program,
}: {
  program: StateBenefitProgram;
}) {
  const fallback = artwork[program.category];
  const [source, setSource] = useState(program.image_url ?? fallback);
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary_subtle">
      {failed ? (
        <div
          className="flex h-full items-center justify-center"
          role="img"
          aria-label={copy.imageAlt(program.name)}
        >
          <UiIcon name="image" className="size-10 text-tertiary" />
        </div>
      ) : (
        <Image
          fill
          unoptimized
          src={source}
          alt={copy.imageAlt(program.name)}
          sizes="(max-width: 767px) 90vw, 640px"
          className="object-contain p-3"
          onError={() =>
            source === fallback ? setFailed(true) : setSource(fallback)
          }
        />
      )}
    </div>
  );
}
