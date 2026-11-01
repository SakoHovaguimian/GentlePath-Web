import Link from 'next/link';
import { Button, EmptyState } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { Resource } from '../models/resource';
import { CollectionPagination, collectionOffset } from './CollectionPagination';
import { ResourceCard } from './ResourceCard';

export function ResourceResults({
  resources,
  offset,
  onNavigate,
  onSave,
  busyId,
  savedEmpty = false,
  collections = false,
  onClear,
}: {
  resources: Resource[];
  offset: number;
  onNavigate: (offset: number) => void;
  onSave: (resource: Resource) => void;
  busyId?: string;
  savedEmpty?: boolean;
  collections?: boolean;
  onClear: () => void;
}) {
  const safeOffset = collectionOffset(offset, resources.length);
  if (!resources.length)
    return (
      <EmptyState
        icon="file"
        title={
          savedEmpty
            ? copy.resources.emptySavedTitle
            : collections
              ? copy.resources.emptyCollectionsTitle
              : copy.common.noResultsTitle
        }
        description={
          savedEmpty
            ? copy.resources.emptySavedHint
            : collections
              ? copy.resources.emptyCollectionsHint
              : copy.common.noResultsHint
        }
        action={
          savedEmpty ? (
            <Button asChild variant="secondary">
              <Link href="/resources">{copy.resources.explore}</Link>
            </Button>
          ) : (
            <Button variant="secondary" onClick={onClear}>
              {copy.common.clear}
            </Button>
          )
        }
      />
    );
  return (
    <>
      <div className="gp-resource-grid">
        {resources.slice(safeOffset, safeOffset + 9).map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            headingLevel="h3"
            busy={busyId === resource.id}
            onSave={onSave}
          />
        ))}
      </div>
      <CollectionPagination
        total={resources.length}
        offset={safeOffset}
        onNavigate={onNavigate}
      />
    </>
  );
}
