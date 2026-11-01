import { gentlePathEditorialDiscoveryStrings as copy } from '@/strings';
import { formatBlogDate } from '@/modules/blog/formatBlogDate';

export function ResourceSourceStatus({
  stateCodes,
  officialSourceUrl,
  verifiedAt,
  detail = false,
}: {
  stateCodes: string[];
  officialSourceUrl: string | null;
  verifiedAt: string | null;
  detail?: boolean;
}) {
  return (
    <div className="relative z-10 grid gap-1 text-xs text-tertiary">
      <span>{stateCodes.length ? stateCodes.join(', ') : copy.nationwide}</span>
      {(verifiedAt || detail) && (
        <span>
          {verifiedAt
            ? copy.checkedDescription(formatBlogDate(verifiedAt))
            : copy.notChecked}
        </span>
      )}
      {detail && officialSourceUrl && (
        <a
          href={officialSourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-brand-secondary underline underline-offset-4 hover:text-primary"
        >
          {copy.officialSource}
        </a>
      )}
    </div>
  );
}
