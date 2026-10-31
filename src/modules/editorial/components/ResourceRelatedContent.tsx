'use client';

import Link from 'next/link';
import { Button, Card, PageSection, UiIcon } from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { Resource } from '@/modules/portal/models/resource';
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
