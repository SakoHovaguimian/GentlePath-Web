'use client';

import Link from 'next/link';
import { Button, PageSection, UiIcon } from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { Resource } from '@/modules/portal/models/resource';
import { ResourceCard } from '@/modules/portal/components/ResourceCard';
import { ContentUrlSchema } from '../models/contentUrl';

export function ResourceRelatedContent({
  resource,
  resources,
}: {
  resource: Resource;
  resources: Resource[];
}) {
  const target = ContentUrlSchema.safeParse(resource.url);
  const children = resources.filter((item) => item.parentId === resource.id);
  const parent = resources.find((item) => item.id === resource.parentId);
  if (!parent && !children.length && !target.success) return null;
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
      {target.success && (
        <Button asChild variant="secondary" className="justify-self-start">
          <a href={target.data} target="_blank" rel="noopener noreferrer">
            {copy.openExternal}
            <UiIcon name="arrowRight" />
          </a>
        </Button>
      )}
      {children.length > 0 && (
        <PageSection
          id="collection-children"
          title={copy.childrenTitle}
          description={copy.collectionChildCount(children.length)}
        >
          <div className="gp-resource-grid">
            {children.map((item) => (
              <ResourceCard key={item.id} resource={item} headingLevel="h3" />
            ))}
          </div>
        </PageSection>
      )}
    </div>
  );
}
