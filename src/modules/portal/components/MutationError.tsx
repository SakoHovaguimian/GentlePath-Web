import { gentlePathPortalStrings as copy } from '@/strings';
import { DomainError } from '@/errors/domainErrors';

export function MutationError({ error, id }: { error: unknown; id?: string }) {
  if (!error) return null;
  return (
    <p
      id={id}
      role="alert"
      className="rounded-xl border border-error_subtle bg-error-primary px-4 py-3 text-sm text-error-primary"
    >
      {error instanceof DomainError && error.status < 500
        ? error.message
        : copy.common.errorHint}
    </p>
  );
}
