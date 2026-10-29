'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  MarkdownContent,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useResources, useSaveResource } from './hooks';
import { MutationError } from './components/MutationError';
import { getResourceArtwork } from './components/resourceArtwork';
import './styles/portal.css';

export function ResourceDetailScreen({ id }: { id: string }) {
  const query = useResources();
  const mutation = useSaveResource();
  const { demoMode } = useRuntimeConfig();
  const { showToast } = usePresentationService();
  return (
    <QueryBoundary query={query}>
      {(resources) => {
        const resource = resources.find((item) => item.id === id);
        if (!resource)
          return (
            <EmptyState
              title={copy.common.noResultsTitle}
              description={copy.common.noResultsHint}
              action={
                <Button asChild>
                  <Link href="/resources">{copy.resources.explore}</Link>
                </Button>
              }
            />
          );
        const illustration = getResourceArtwork(resource);
        return (
          <Page className="gp-portal-page gp-resource-detail">
            <PageHeader
              title={resource.title}
              description={resource.description}
              breadcrumbs={[
                { label: copy.navigation.resources, href: '/resources' },
                { label: resource.title },
              ]}
              eyebrow={copy.resources.categories[resource.category]}
              action={
                <Button
                  variant={resource.saved ? 'secondary' : 'primary'}
                  loading={mutation.isPending}
                  aria-pressed={resource.saved}
                  onClick={async () => {
                    try {
                      await mutation.mutateAsync({
                        id: resource.id,
                        saved: !resource.saved,
                      });
                      void showToast({
                        title: resource.saved
                          ? copy.resources.unsavedToast
                          : copy.resources.savedToast,
                        intent: 'success',
                      });
                    } catch {
                      /* Inline recovery. */
                    }
                  }}
                >
                  <UiIcon name={resource.saved ? 'check' : 'plus'} />
                  {resource.saved ? copy.resources.unsave : copy.resources.save}
                </Button>
              }
            />
            <MutationError error={mutation.error} />
            <div
              className={`gp-resource-detail__hero${illustration.landscape ? '' : ' gp-resource-detail__hero--cutout'}`}
            >
              <Image
                src={illustration.src}
                alt={
                  resource.format === 'guide'
                    ? copy.resources.guideIllustration
                    : copy.resources.illustrations[resource.category]
                }
                fill
                sizes="(max-width: 767px) 100vw, 70vw"
                priority
              />
            </div>
            <div className="gp-resource-detail__meta">
              <Badge>{copy.resources.formats[resource.format]}</Badge>
              <span className="inline-flex items-center gap-2">
                <UiIcon name="clock" className="size-4" />
                {copy.common.minutes(resource.readMinutes)}
              </span>
              {demoMode && (
                <span className="text-xs text-tertiary">
                  {copy.resources.sampleHint}
                </span>
              )}
            </div>
            <Card className="gp-resource-detail__body">
              <MarkdownContent value={resource.body} />
            </Card>
            <Button asChild variant="secondary" className="justify-self-start">
              <Link href="/resources">
                <UiIcon name="chevronLeft" />
                {copy.resources.explore}
              </Link>
            </Button>
          </Page>
        );
      }}
    </QueryBoundary>
  );
}
