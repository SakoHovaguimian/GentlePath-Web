'use client';

import Image from 'next/image';
import { useState } from 'react';
import { UiIcon } from '@/components/ui';
import { gentlePathStateBenefitsStrings as copy } from '@/strings';
import { gentlePathIllustrations } from '@/models/gentlePathIllustrations';
import type { StateBenefitProgram } from '../models/stateBenefitProgram';

const artwork = {
  MEDICAID_WAIVERS: gentlePathIllustrations.benefitMedicaidWaivers,
  RESPITE: gentlePathIllustrations.benefitRespite,
  EARLY_INTERVENTION: gentlePathIllustrations.benefitEarlyIntervention,
  SCHOOL_SUPPORT: gentlePathIllustrations.benefitSchoolSupport,
  DISABILITY_SERVICES: gentlePathIllustrations.benefitDisabilityServices,
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
          unoptimized={source !== fallback}
          src={source}
          alt={
            source === fallback
              ? copy.artworkAlt[program.category]
              : copy.imageAlt(program.name)
          }
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
