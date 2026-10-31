'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  MarkdownContent,
  Message,
  Page,
  PageHeader,
  QueryBoundary,
  Stepper,
  UiIcon,
} from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { useGuide } from './hooks';
import type { Guide } from './models/guide';
import { EditorialImage } from './components/EditorialImage';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';

function GuideReader({ guide }: { guide: Guide }) {
  const [selected, setSelected] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const items = [...guide.items].sort((a, b) => a.position - b.position);
  const index = Math.min(selected, Math.max(0, items.length - 1));
  const item = items[index];
  const choose = (next: number) => {
    setSelected(next);
    requestAnimationFrame(() => heading.current?.focus());
  };
  return (
    <Page>
      <PageHeader
        title={guide.title}
        description={guide.description}
        breadcrumbs={[
          { label: copy.guidesTitle, href: '/guides' },
          { label: guide.title },
        ]}
        meta={<Badge intent="brand">{copy.itemCount(items.length)}</Badge>}
        action={
          <SavedContentButton contentType="GUIDED_STEP" contentId={guide.id} />
        }
      />
      {guide.image_url && (
        <EditorialImage src={guide.image_url} alt={guide.title} />
      )}
      {item && (
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)]">
          <Stepper
            orientation="vertical"
            label={copy.stepNav}
            steps={items.map((step, position) => ({
              key: step.id,
              label: step.title || copy.stepLabel(position + 1),
              state: position === index ? 'current' : 'upcoming',
              stateLabel:
                position === index ? copy.currentStep : copy.availableStep,
            }))}
            onSelect={(key) =>
              choose(items.findIndex((step) => step.id === key))
            }
          />
          <Card className="grid content-start gap-6">
            <div className="grid gap-2">
              <span className="text-sm font-medium text-brand-secondary">
                {copy.stepLabel(index + 1)}
              </span>
              <h2
                ref={heading}
                tabIndex={-1}
                className="m-0 font-display text-2xl font-normal text-primary wrap-anywhere focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                {item.title || copy.stepLabel(index + 1)}
              </h2>
            </div>
            {item.image_url && (
              <EditorialImage
                key={item.image_url}
                src={item.image_url}
                alt={item.title || copy.stepLabel(index + 1)}
              />
            )}
            <MarkdownContent value={item.description} />
            <div className="grid gap-5 border-t border-secondary pt-5">
              {index === items.length - 1 && (
                <Message
                  title={copy.lastStepTitle}
                  description={copy.lastStepHint}
                />
              )}
              <div className="flex flex-wrap justify-between gap-3">
                <Button
                  variant="secondary"
                  disabled={index === 0}
                  onClick={() => choose(index - 1)}
                >
                  <UiIcon name="chevronLeft" />
                  {copy.previousStep}
                </Button>
                <Button
                  variant="secondary"
                  disabled={index === items.length - 1}
                  onClick={() => choose(index + 1)}
                >
                  {copy.nextStep}
                  <UiIcon name="chevronRight" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
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
