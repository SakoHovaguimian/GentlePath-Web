import Image from 'next/image';
import Link from 'next/link';
import { Button, UiIcon } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { Resource } from '../models/resource';
import { getResourceArtwork } from './resourceArtwork';
import { ResourceRatingSummary } from '@/modules/engagement/components/ResourceRatingSummary';

export function ResourceCard({
  resource,
  onSave,
  busy = false,
  headingLevel = 'h2',
}: {
  resource: Resource;
  onSave?: (resource: Resource) => void;
  busy?: boolean;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  const illustration = getResourceArtwork(resource);
  return (
    <article className="gp-resource-card" data-category={resource.category}>
      <Link
        href={`/resources/${resource.id}`}
        className={`gp-resource-card__image${illustration.landscape ? ' gp-resource-card__image--landscape' : ''}`}
      >
        <Image
          src={illustration.src}
          alt={
            resource.format === 'guide'
              ? copy.resources.guideIllustration
              : copy.resources.illustrations[resource.category]
          }
          width={540}
          height={360}
        />
      </Link>
      <div className="gp-resource-card__body">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="gp-resource-card__category">
            {copy.resources.categories[resource.category]}
          </span>
          <span className="text-xs text-tertiary">
            {copy.common.minutes(resource.readMinutes)}
          </span>
        </div>
        <Heading>
          <Link
            className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand"
            href={`/resources/${resource.id}`}
          >
            {resource.title}
          </Link>
        </Heading>
        <ResourceRatingSummary ratings={resource.ratings} compact />
        <p className="m-0 flex-1 text-sm leading-relaxed text-secondary">
          {resource.description}
        </p>
        <div className="gp-resource-card__footer">
          <span className="text-xs text-tertiary">
            {copy.resources.formats[resource.format]}
          </span>
          {onSave && (
            <Button
              variant={resource.saved ? 'destructive' : 'ghost'}
              className="min-h-10 px-2 text-xs"
              loading={busy}
              aria-pressed={resource.saved}
              onClick={() => onSave(resource)}
            >
              <UiIcon
                name={resource.saved ? 'trash' : 'plus'}
                className="size-4"
              />
              {resource.saved ? copy.resources.unsave : copy.resources.save}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
