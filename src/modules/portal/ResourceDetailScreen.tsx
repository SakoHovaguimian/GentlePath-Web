'use client';

import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  MarkdownContent,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useResources, useSaveResource } from './hooks';
import { MutationError } from './components/MutationError';

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
        return (
          <div className="mx-auto grid w-full max-w-4xl gap-7">
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
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{copy.resources.formats[resource.format]}</Badge>
              <span className="text-sm text-tertiary">
                {copy.common.minutes(resource.readMinutes)}
              </span>
              {demoMode && (
                <span className="text-xs text-tertiary">
                  {copy.resources.sampleHint}
                </span>
              )}
            </div>
            <Card className="p-6 sm:p-9">
              <MarkdownContent value={resource.body} />
            </Card>
            <Button asChild variant="secondary" className="justify-self-start">
              <Link href="/resources">
                <UiIcon name="chevronLeft" />
                {copy.resources.explore}
              </Link>
            </Button>
          </div>
        );
      }}
    </QueryBoundary>
  );
}
