'use client';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { gentlePathEngagementStrings as copy } from '@/strings';
import { DomainError } from '@/errors/domainErrors';
import { useSavedItem } from './hooks';
import { SavedContentButton } from './components/SavedContentButton';
import '@/modules/portal/styles/portal.css';
export function SavedContentDetailScreen({ id }: { id: string }) {
  const query = useSavedItem(id);
  if (query.error instanceof DomainError && query.error.status === 404)
    return (
      <Page className="gp-portal-page">
        <EmptyState
          icon="pin"
          title={copy.unavailableTitle}
          description={copy.unavailableHint}
          action={
            <Button asChild>
              <Link href="/saved">{copy.back}</Link>
            </Button>
          }
        />
      </Page>
    );
  return (
    <QueryBoundary query={query}>
      {(item) => (
        <Page className="gp-portal-page">
          <PageHeader
            title={item.target?.title || copy.untitled}
            description={copy.previewDescription}
            breadcrumbs={[
              { label: copy.title, href: '/saved' },
              { label: copy.previewTitle },
            ]}
            action={
              <SavedContentButton
                contentType={item.contentType}
                contentId={item.contentId}
              />
            }
          />
          <Card className="grid gap-4">
            <Badge>{copy.types[item.contentType]}</Badge>
            <p className="m-0 whitespace-pre-wrap wrap-anywhere text-secondary">
              {item.target?.preview || copy.unavailableDescription}
            </p>
            {item.target?.readerPath && (
              <Button asChild className="justify-self-start">
                <Link href={item.target.readerPath as Route}>
                  {copy.read}
                  <UiIcon name="arrowRight" className="size-4" />
                </Link>
              </Button>
            )}
          </Card>
          <Button asChild variant="secondary" className="justify-self-start">
            <Link href="/saved">
              <UiIcon name="chevronLeft" className="size-4" />
              {copy.back}
            </Link>
          </Button>
        </Page>
      )}
    </QueryBoundary>
  );
}
