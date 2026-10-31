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
      <Image
        className="gp-brand-mark"
        src="/gentlepath/brand-blocks.png"
        width={48}
        height={48}
        alt={gentlePathLandingStrings.decorativeAlt}
        aria-hidden="true"
      />
      <span className={compact ? 'sr-only' : 'gp-brand-wordmark'}>
        {gentlePathLandingStrings.brandTitle}
      </span>
    </span>
  );
}
