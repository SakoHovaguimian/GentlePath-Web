import Image from 'next/image';
import Link from 'next/link';
import { Button, Badge, UiIcon } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { Resource } from '../models/resource';

const illustrations = {
  everyday: '/gentlepath/growing-together.png',
  education: '/gentlepath/care-folder.png',
  communication: '/gentlepath/parent-and-child.png',
  wellbeing: '/gentlepath/caregiver-community.png',
};
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
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-secondary bg-primary">
      <Link
        href={`/resources/${resource.id}`}
        className="grid h-44 place-items-center bg-secondary_subtle outline-offset-4 focus-visible:outline-2 focus-visible:outline-brand"
      >
        <Image
          src={illustrations[resource.category]}
          alt={copy.resources.illustrations[resource.category]}
          width={180}
          height={180}
          className="size-40 object-contain transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge>{copy.resources.categories[resource.category]}</Badge>
          <span className="text-xs text-tertiary">
            {copy.common.minutes(resource.readMinutes)}
          </span>
        </div>
        <Heading className="m-0 font-display text-lg text-primary">
          <Link
            className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-brand"
            href={`/resources/${resource.id}`}
          >
            {resource.title}
          </Link>
        </Heading>
        <p className="m-0 flex-1 text-sm leading-relaxed text-secondary">
          {resource.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-tertiary">
            {copy.resources.formats[resource.format]}
          </span>
          {onSave && (
            <Button
              variant="ghost"
              className="min-h-10 px-2 text-xs"
              loading={busy}
              aria-pressed={resource.saved}
              onClick={() => onSave(resource)}
            >
              <UiIcon
                name={resource.saved ? 'check' : 'plus'}
                className="size-4"
              />
              {resource.saved ? copy.common.saved : copy.resources.save}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
