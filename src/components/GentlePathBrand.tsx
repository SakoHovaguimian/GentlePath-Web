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
      <svg
        className="gp-brand-mark"
        viewBox="0 0 36 40"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="gp-brand-leaf-primary"
          d="M16.4 3.6C5.2 6.4 2.7 17.2 7.6 26.3 18.2 23.7 23.8 13.5 16.4 3.6Z"
        />
        <path
          className="gp-brand-leaf-secondary"
          d="M24 17.6c8.9 3.1 10.9 11.7 6.1 18.5-8.7-2.5-13.3-10.9-6.1-18.5Z"
        />
        <path
          className="gp-brand-stem"
          d="M13.2 15.7c-2.8 6.8-2.9 13.8.2 20.4m12.9-8.8c-3.6 3.1-6.9 6.5-8.8 10.2"
        />
      </svg>
      <span className={compact ? 'sr-only' : 'gp-brand-wordmark'}>
        {gentlePathLandingStrings.brandTitle}
      </span>
    </span>
  );
}
