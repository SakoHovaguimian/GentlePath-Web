import Image from 'next/image';
import Link from 'next/link';
import { BookmarkButton, IconMenu } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { ResourceCardProps } from '../models/resourceCardProps';
import { getResourceArtwork } from './resourceArtwork';
import { ResourceRatingSummary } from '@/modules/engagement/components/ResourceRatingSummary';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';

export function ResourceCard({
  resource,
  onSave,
  busy = false,
  headingLevel = 'h2',
}: ResourceCardProps) {
  const Heading = headingLevel;
  const illustration = getResourceArtwork(resource);
  return (
    <article className="gp-resource-card" data-category={resource.category}>
      {onSave ? (
        <div className="gp-resource-card__menu">
          <IconMenu
            label={copy.resources.actionsLabel(resource.title)}
            disabled={busy}
            items={[
              {
                id: 'save',
                label: resource.saved
                  ? copy.resources.unsave
                  : copy.resources.save,
                icon: 'bookmark',
                selected: resource.saved,
              },
            ]}
            onAction={() => onSave(resource)}
          />
        </div>
      ) : (
        <div className="gp-resource-card__menu">
          <SavedContentButton
            contentType="RESOURCE"
            contentId={resource.id}
            variant="menu"
            menuLabel={copy.resources.actionsLabel(resource.title)}
          />
        </div>
      )}
      <div
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
      </div>
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
            className="gp-resource-card__open underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand"
            href={`/resources/${resource.id}`}
          >
            {resource.title}
          </Link>
        </Heading>
        <p className="m-0 flex-1 text-sm leading-relaxed text-secondary">
          {resource.description}
        </p>
        <ResourceRatingSummary ratings={resource.ratings} compact />
        <div className="gp-resource-card__footer">
          <span className="text-xs text-tertiary">
            {copy.resources.formats[resource.format]}
          </span>
          {onSave ? (
            <BookmarkButton
              saved={resource.saved}
              variant="ghost"
              className="relative z-10 min-h-10 px-2 text-xs"
              loading={busy}
              aria-pressed={resource.saved}
              onClick={() => onSave(resource)}
            />
          ) : (
            <div className="relative z-10">
              <SavedContentButton
                contentType="RESOURCE"
                contentId={resource.id}
                variant="ghost"
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
