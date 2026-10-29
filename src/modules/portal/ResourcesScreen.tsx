'use client';

import Link from 'next/link';
import {
  Button,
  DirectoryFilters,
  EmptyState,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useResources, useSaveResource } from './hooks';
import { usePortalDirectory } from './usePortalDirectory';
import { ResourceCard } from './components/ResourceCard';
import { MutationError } from './components/MutationError';
import {
  CollectionPagination,
  collectionOffset,
} from './components/CollectionPagination';
import type { Resource } from './models/resource';
import { PortalBanner } from './components/PortalBanner';
import { resourceArtwork } from './components/resourceArtwork';
import './styles/portal.css';

export function ResourcesScreen({
  savedOnly = false,
}: {
  savedOnly?: boolean;
}) {
  const query = useResources();
  const mutation = useSaveResource();
  const directory = usePortalDirectory();
  const { showToast } = usePresentationService();
  async function toggle(resource: Resource) {
    try {
      await mutation.mutateAsync({ id: resource.id, saved: !resource.saved });
      void showToast({
        title: resource.saved
          ? copy.resources.unsavedToast
          : copy.resources.savedToast,
        intent: 'success',
      });
    } catch {
      /* Inline recovery. */
    }
  }
  return (
    <Page className="gp-portal-page gp-resources">
      <PageHeader
        title={savedOnly ? copy.resources.savedTitle : copy.resources.title}
        description={
          savedOnly
            ? copy.resources.savedDescription
            : copy.resources.description
        }
        eyebrow={copy.navigation.resources}
        action={
          savedOnly ? (
            <Button asChild variant="secondary">
              <Link href="/resources">{copy.resources.explore}</Link>
            </Button>
          ) : undefined
        }
      />
      <DirectoryFilters
        id="resource-search"
        value={{
          query: directory.query,
          status: directory.status || undefined,
        }}
        onChange={(value) =>
          directory.update({
            query: value.query,
            status: value.status,
            offset: undefined,
          })
        }
        statuses={Object.entries(copy.resources.categories).map(
          ([value, label]) => ({ value, label }),
        )}
        copy={{
          search: copy.common.search,
          placeholder: copy.resources.searchPlaceholder,
          clear: copy.common.clear,
          status: copy.common.category,
          allStatuses: copy.common.allCategories,
        }}
      />
      {!savedOnly && !directory.query && !directory.status && (
        <section className="gp-resource-collections">
          <div className="gp-portal-section-heading">
            <h2>{copy.resources.collectionsTitle}</h2>
          </div>
          <div className="gp-resource-collections__grid">
            {(['everyday', 'communication'] as const).map((category) => (
              <PortalBanner
                key={category}
                title={copy.resources.categories[category]}
                headingLevel="h3"
                description={copy.resources.collectionHints[category]}
                image={resourceArtwork[category].src}
                tone={category === 'communication' ? 'lilac' : 'sage'}
                landscape={resourceArtwork[category].landscape}
                action={
                  <Button
                    onClick={() =>
                      directory.update({
                        status: category,
                        offset: undefined,
                      })
                    }
                  >
                    {copy.resources.collectionAction}
                    <UiIcon name="arrowRight" className="size-4" />
                  </Button>
                }
              />
            ))}
          </div>
        </section>
      )}
      <MutationError error={mutation.error} />
      <QueryBoundary query={query}>
        {(resources) => {
          const filtered = resources.filter(
            (resource) =>
              (!savedOnly || resource.saved) &&
              (!directory.status || resource.category === directory.status) &&
              `${resource.title} ${resource.description}`
                .toLocaleLowerCase()
                .includes(directory.query.toLocaleLowerCase()),
          );
          const offset = collectionOffset(directory.offset, filtered.length);
          return filtered.length ? (
            <>
              <div className="gp-resource-grid">
                {filtered.slice(offset, offset + 9).map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    busy={
                      mutation.isPending &&
                      mutation.variables.id === resource.id
                    }
                    onSave={(item) => {
                      void toggle(item);
                    }}
                  />
                ))}
              </div>
              <CollectionPagination
                total={filtered.length}
                offset={offset}
                onNavigate={directory.setOffset}
              />
            </>
          ) : (
            <EmptyState
              icon="file"
              title={
                savedOnly && !directory.query && !directory.status
                  ? copy.resources.emptySavedTitle
                  : copy.common.noResultsTitle
              }
              description={
                savedOnly && !directory.query && !directory.status
                  ? copy.resources.emptySavedHint
                  : copy.common.noResultsHint
              }
              action={
                <Button asChild variant="secondary">
                  <Link href={savedOnly ? '/resources' : '/resources'}>
                    {savedOnly ? copy.resources.explore : copy.common.clear}
                  </Link>
                </Button>
              }
            />
          );
        }}
      </QueryBoundary>
    </Page>
  );
}
