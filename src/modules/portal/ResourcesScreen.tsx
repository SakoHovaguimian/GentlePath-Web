'use client';

import Link from 'next/link';
import {
  Button,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useResources, useSaveResource } from './hooks';
import { useResourceDirectory } from './useResourceDirectory';
import { ResourceFilters } from './components/ResourceFilters';
import { ResourceResults } from './components/ResourceResults';
import { MutationError } from './components/MutationError';
import type { Resource } from './models/resource';
import { PortalBanner } from './components/PortalBanner';
import { getResourceArtwork } from './components/resourceArtwork';
import { browseResources, isResourceCollection } from './resourceBrowsing';
import './styles/portal.css';
import './styles/resources.css';

export function ResourcesScreen({
  savedOnly = false,
  browse = false,
}: {
  savedOnly?: boolean;
  browse?: boolean;
}) {
  const query = useResources();
  const mutation = useSaveResource();
  const directory = useResourceDirectory();
  const { showToast } = usePresentationService();
  const collections = browse && directory.mode === 'collections';
  const hasFilters = Boolean(
    directory.query ||
    directory.category ||
    directory.tag ||
    directory.stateCode,
  );
  async function toggle(resource: Resource) {
    if (mutation.isPending) return;
    try {
      await mutation.mutateAsync({ id: resource.id, saved: !resource.saved });
      if (!resource.saved)
        void showToast({ title: copy.resources.savedToast, intent: 'success' });
    } catch {
      /* Inline recovery. */
    }
  }
  function browseHref(mode: 'resources' | 'collections') {
    const params = new URLSearchParams({ mode });
    if (directory.query) params.set('query', directory.query);
    if (directory.category) params.set('status', directory.category);
    if (directory.tag) params.set('tag', directory.tag);
    if (directory.stateCode) params.set('state', directory.stateCode);
    if (directory.sort !== 'title') params.set('sort', directory.sort);
    return { pathname: '/resources/browse', query: Object.fromEntries(params) };
  }
  return (
    <Page className="gp-portal-page gp-resources">
      <PageHeader
        title={
          savedOnly
            ? copy.resources.savedTitle
            : browse
              ? collections
                ? copy.resources.collectionsTitle
                : copy.resources.browseTitle
              : copy.resources.title
        }
        description={
          savedOnly
            ? copy.resources.savedDescription
            : collections
              ? copy.resources.collectionsDescription
              : copy.resources.description
        }
        eyebrow={copy.navigation.resources}
        action={
          savedOnly || browse ? (
            <Button asChild variant="secondary">
              <Link href="/resources">{copy.resources.explore}</Link>
            </Button>
          ) : undefined
        }
      />
      {browse && (
        <nav
          className="gp-resource-browse-nav"
          aria-label={copy.resources.browseNavigationLabel}
        >
          {(['resources', 'collections'] as const).map((mode) => (
            <Button
              key={mode}
              asChild
              variant={directory.mode === mode ? 'primary' : 'secondary'}
            >
              <Link
                href={browseHref(mode)}
                aria-current={directory.mode === mode ? 'page' : undefined}
              >
                {mode === 'resources'
                  ? copy.resources.browseTitle
                  : copy.resources.collectionsTitle}
              </Link>
            </Button>
          ))}
        </nav>
      )}
      <ResourceFilters
        resources={(query.data ?? []).filter((resource) =>
          savedOnly || !browse
            ? true
            : isResourceCollection(resource) === collections,
        )}
        directory={directory}
      />
      <MutationError error={mutation.error} />
      <QueryBoundary query={query}>
        {(resources) => {
          const filters = {
            query: directory.query,
            category: directory.category,
            stateCode: directory.stateCode,
            tag: directory.tag,
            sort: directory.sort,
            savedOnly,
          };
          const results = browseResources(resources, {
            ...filters,
            mode: savedOnly
              ? undefined
              : collections
                ? 'collections'
                : 'resources',
          });
          const collectionPreview = browseResources(resources, {
            ...filters,
            mode: 'collections',
          }).slice(0, 2);
          return (
            <>
              {!savedOnly && !browse && (
                <section
                  className="gp-resource-collections"
                  aria-labelledby="resource-collections-heading"
                >
                  <div className="gp-portal-section-heading">
                    <h2 id="resource-collections-heading">
                      {copy.resources.collectionsTitle}
                    </h2>
                    <Button asChild variant="ghost">
                      <Link
                        href={browseHref('collections')}
                        aria-label={copy.resources.viewAllCollectionsLabel}
                      >
                        {copy.resources.viewAll}
                        <UiIcon name="arrowRight" className="size-4" />
                      </Link>
                    </Button>
                  </div>
                  {collectionPreview.length ? (
                    <div className="gp-resource-collections__grid">
                      {collectionPreview.map((collection) => {
                        const artwork = getResourceArtwork(collection);
                        return (
                          <PortalBanner
                            key={collection.id}
                            title={collection.title}
                            headingLevel="h3"
                            description={collection.description}
                            image={artwork.src}
                            tone={
                              collection.category === 'communication'
                                ? 'lilac'
                                : 'sage'
                            }
                            landscape={artwork.landscape}
                            action={
                              <Button asChild>
                                <Link href={`/resources/${collection.id}`}>
                                  {copy.resources.collectionAction}
                                  <UiIcon
                                    name="arrowRight"
                                    className="size-4"
                                  />
                                </Link>
                              </Button>
                            }
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="m-0 text-sm text-secondary">
                      {copy.resources.emptyCollectionsHint}
                    </p>
                  )}
                </section>
              )}
              <section
                className="gp-resource-results"
                aria-labelledby="resource-results-heading"
              >
                <div className="gp-portal-section-heading">
                  <h2 id="resource-results-heading">
                    {savedOnly
                      ? copy.resources.savedTitle
                      : collections
                        ? copy.resources.collectionsTitle
                        : copy.resources.browseTitle}
                  </h2>
                  {!savedOnly && !browse && (
                    <Button asChild variant="ghost">
                      <Link
                        href={browseHref('resources')}
                        aria-label={copy.resources.viewAllResourcesLabel}
                      >
                        {copy.resources.viewAll}
                        <UiIcon name="arrowRight" className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
                <ResourceResults
                  resources={results}
                  offset={directory.offset}
                  onNavigate={directory.setOffset}
                  onSave={(resource) => {
                    void toggle(resource);
                  }}
                  busyId={
                    mutation.isPending ? mutation.variables.id : undefined
                  }
                  savedEmpty={savedOnly && !hasFilters}
                  collections={collections}
                  onClear={directory.clear}
                />
              </section>
            </>
          );
        }}
      </QueryBoundary>
    </Page>
  );
}
