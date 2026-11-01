import Image from 'next/image';
import { gentlePathLandingStrings } from '@/strings';

export function GentlePathBrand({
  compact = false,
  className = '',
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`gp-brand ${className}`}>
      <span className="gp-brand-mark" aria-hidden="true">
        <Image
          src="/gentlepath/app-icon.png"
          width={48}
          height={48}
          alt={gentlePathLandingStrings.decorativeAlt}
        />
      </span>
      <span className={compact ? 'sr-only' : 'gp-brand-wordmark'}>
        {gentlePathLandingStrings.brandTitle}
      </span>
    </span>
  );
}
