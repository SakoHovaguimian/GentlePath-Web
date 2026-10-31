import type { ReactNode } from 'react';
import { Button, QueryBoundary } from '@/components/ui';
import { strings } from '@/strings';
import { MutationError } from '@/modules/portal/components/MutationError';
import type { useFamilyPreferences } from '../hooks';
import type { FamilyPreferences } from '../models/familyPreferences';

export function FamilyPreferencesBoundary({
  query,
  children,
}: {
  query: ReturnType<typeof useFamilyPreferences>;
  children: (settings: FamilyPreferences) => ReactNode;
}) {
  const errorStatus =
    query.isError && 'status' in query.error
      ? Number(query.error.status)
      : undefined;
  const retainDraft =
    query.data !== undefined && ![401, 403, 404].includes(Number(errorStatus));
  return (
    <>
      {query.isError && retainDraft && (
        <div className="grid gap-2">
          <MutationError error={query.error} />
          <Button
            variant="secondary"
            className="justify-self-start"
            loading={query.isFetching}
            onClick={() => void query.refetch()}
          >
            {strings.ui.queryBoundary.tryAgain}
          </Button>
        </div>
      )}
      <QueryBoundary query={query} showError={!retainDraft}>
        {children}
      </QueryBoundary>
    </>
  );
}
