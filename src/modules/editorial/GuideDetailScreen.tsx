'use client';

import Link from 'next/link';
import {
  Badge,
  Button,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { useGuide } from './hooks';
import type { Guide } from './models/guide';
import { EditorialImage } from './components/EditorialImage';
import { GuideSteps } from './components/GuideSteps';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';

function GuideReader({ guide }: { guide: Guide }) {
  return (
    <Page>
      <PageHeader
        title={guide.title}
        description={guide.description}
        breadcrumbs={[
          { label: copy.guidesTitle, href: '/guides' },
          { label: guide.title },
        ]}
        meta={
          <Badge intent="brand">{copy.itemCount(guide.items.length)}</Badge>
        }
        action={
          <SavedContentButton contentType="GUIDED_STEP" contentId={guide.id} />
        }
      />
      {guide.image_url && (
        <EditorialImage src={guide.image_url} alt={guide.title} />
      )}
      <GuideSteps steps={guide.items} />
      <Button asChild variant="ghost" className="justify-self-start">
        <Link href="/guides">
          <UiIcon name="chevronLeft" />
          {copy.backToGuides}
        </Link>
      </Button>
    </Page>
  );
}

export function GuideDetailScreen({ id }: { id: string }) {
  const guide = useGuide(id);
  return (
    <QueryBoundary query={guide} loadingMessage={copy.loadingLabel}>
      {(data) => <GuideReader key={data.id} guide={data} />}
    </QueryBoundary>
  );
}
