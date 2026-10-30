import Link from 'next/link';
import {
  Badge,
  Button,
  Card,
  IconTile,
  RecordThumbnail,
  UiIcon,
} from '@/components/ui';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { Guide } from '../models/guide';

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Card className="relative flex min-w-0 flex-col gap-5 hover:border-brand focus-within:border-brand">
      <div className="flex items-start gap-4">
        {guide.image_url ? (
          <RecordThumbnail src={guide.image_url} alt={guide.title} />
        ) : (
          <IconTile className="size-16">
            <UiIcon name="leaf" className="size-7" />
          </IconTile>
        )}
        <div className="grid min-w-0 flex-1 gap-2">
          <Badge intent="brand">{copy.itemCount(guide.items.length)}</Badge>
          <h2 className="m-0 font-display text-xl font-normal text-primary wrap-anywhere">
            <Link
              className="ui-card-open hover:text-brand-secondary"
              href={`/guides/${guide.id}`}
            >
              {guide.title}
            </Link>
          </h2>
        </div>
        <div className="relative z-20">
          <SavedContentButton
            contentType="GUIDED_STEP"
            contentId={guide.id}
            variant="menu"
            menuLabel={copy.guideActionsLabel(guide.title)}
          />
        </div>
      </div>
      <p className="m-0 flex-1 text-sm text-secondary">{guide.description}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-4">
        <Button asChild variant="secondary" className="relative z-10">
          <Link href={`/guides/${guide.id}`}>
            {copy.openGuide}
            <UiIcon name="arrowRight" />
          </Link>
        </Button>
        <div className="relative z-10 ms-auto">
          <SavedContentButton contentType="GUIDED_STEP" contentId={guide.id} />
        </div>
      </div>
    </Card>
  );
}
