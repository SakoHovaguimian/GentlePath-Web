'use client';

import { useRef, useState } from 'react';
import {
  Button,
  Card,
  MarkdownContent,
  Message,
  Stepper,
  UiIcon,
} from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { GuideStepContent } from '../models/guideItem';
import { EditorialImage } from './EditorialImage';

export function GuideSteps({ steps }: { steps: GuideStepContent[] }) {
  const [selected, setSelected] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const items = [...steps].sort((a, b) => a.position - b.position);
  const index = Math.min(selected, Math.max(0, items.length - 1));
  const item = items[index];
  const choose = (next: number) => {
    setSelected(next);
    requestAnimationFrame(() => heading.current?.focus());
  };
  if (!item) return null;
  return (
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
        onSelect={(key) => choose(items.findIndex((step) => step.id === key))}
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
  );
}
