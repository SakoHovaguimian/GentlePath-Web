'use client';

import Link from 'next/link';
import {
  Button,
  Card,
  DescriptionList,
  PageSection,
  UiIcon,
} from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { Resource } from '@/modules/portal/models/resource';
import { formatBlogDate } from '@/modules/blog/formatBlogDate';
import { ContentUrlSchema } from '../models/contentUrl';
import { useCurrentTimezone } from '@/components/ui/lib/useCurrentTimezone';

export function ResourceProvenance({
  resource,
  resources,
}: {
  resource: Resource;
  resources: Resource[];
}) {
  const source = ContentUrlSchema.safeParse(resource.sourceUrl);
  const timezone = useCurrentTimezone();
  const target = ContentUrlSchema.safeParse(resource.url);
  const children = resources.filter((item) => item.parentId === resource.id);
  const parent = resources.find((item) => item.id === resource.parentId);
  return (
    <div className="grid min-w-0 gap-6">
      {parent && (
        <Button asChild variant="ghost" className="justify-self-start">
          <Link href={`/resources/${parent.id}`}>
            <UiIcon name="chevronLeft" />
            {parent.title}
          </Link>
        </Button>
      )}
      {(resource.sourceName || source.success || resource.reviewedAt) && (
        <Card className="grid gap-4">
          <h2 className="m-0 font-display text-xl font-normal text-primary">
            {copy.sourceTitle}
          </h2>
          <DescriptionList
            items={[
              ...(resource.sourceName
                ? [{ label: copy.sourceNameLabel, value: resource.sourceName }]
                : []),
              ...(resource.sourcePublishedAt
                ? [
                    {
                      label: copy.sourceDateLabel,
                      value: formatBlogDate(
                        `${resource.sourcePublishedAt}T12:00:00Z`,
                        false,
                        'UTC',
                      ),
                    },
                  ]
                : []),
              ...(resource.reviewedAt
                ? [
                    {
                      label: copy.reviewedLabel,
                      value: timezone
                        ? formatBlogDate(resource.reviewedAt, false, timezone)
                        : resource.reviewedAt.slice(0, 10),
                    },
                  ]
                : []),
            ]}
          />
          <div className="flex flex-wrap gap-2">
            {source.success && (
              <Button asChild variant="secondary">
                <a href={source.data} target="_blank" rel="noopener noreferrer">
                  {copy.sourceLink}
                  <UiIcon name="arrowRight" />
                </a>
              </Button>
            )}
            {target.success && target.data !== source.data && (
              <Button asChild variant="secondary">
                <a href={target.data} target="_blank" rel="noopener noreferrer">
                  {copy.openExternal}
                  <UiIcon name="arrowRight" />
                </a>
              </Button>
            )}
          </div>
          <p className="m-0 text-xs text-tertiary">{copy.reviewDescription}</p>
        </Card>
      )}
      {children.length > 0 && (
        <PageSection
          id="collection-children"
          title={copy.childrenTitle}
          description={copy.collectionChildCount(children.length)}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {children.map((item) => (
              <Card key={item.id} className="grid content-start gap-2">
                <Link
                  className="font-display text-lg text-primary hover:text-brand-secondary"
                  href={`/resources/${item.id}`}
                >
                  {item.title}
                </Link>
                <p className="m-0 text-sm text-secondary">{item.description}</p>
              </Card>
            ))}
          </div>
        </PageSection>
      )}
    </div>
  );
}
