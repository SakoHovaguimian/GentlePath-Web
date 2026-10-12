'use client';

import { useState } from 'react';
import {
  CardView,
  MetricCard,
  SectionCardView,
  Switch,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';
const copy = strings.componentLibrary;

export function CardsShowcase() {
  const [active, setActive] = useState(true);
  const presentation = usePresentationService();
  const preview = () => {
    void presentation.showSheet({
      title: copy.sheetTitle,
      description: copy.sheetHint,
      content: copy.sheetContent,
      confirmLabel: copy.close,
      cancelLabel: copy.cancel,
    });
  };
  return (
    <ShowcaseSection
      id="cards"
      title={copy.cards}
      description={copy.cardsHint}
      icon="leaf"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <h4 className="m-0 text-xs font-medium text-secondary">
            {copy.standardCard}
          </h4>
          <CardView
            title={copy.basicDetails}
            description={copy.basicDetailsHint}
            icon={<UiIcon name="leaf" />}
          />
        </div>
        <div className="grid gap-2">
          <h4 className="m-0 text-xs font-medium text-secondary">
            {copy.sectionCard}
          </h4>
          <SectionCardView
            title={copy.productInformation}
            description={copy.productInformationHint}
            icon={<UiIcon name="leaf" />}
            accent
            onClick={preview}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <div className="grid content-start gap-2">
          <h4 className="m-0 text-xs font-medium text-secondary">
            {copy.compactCard}
          </h4>
          <CardView
            title={copy.indica}
            description={copy.category}
            icon={<UiIcon name="tag" />}
          />
        </div>
        <MetricCard
          eyebrow={copy.statCard}
          value={copy.sampleTotal}
          caption={copy.totalProducts}
          change={copy.sampleChange}
        />
        <div className="grid content-start gap-2">
          <h4 className="m-0 text-xs font-medium text-secondary">
            {copy.statusCard}
          </h4>
          <CardView
            title={copy.active}
            description={active ? copy.productLive : copy.productInactive}
          >
            <Switch
              label={copy.active}
              checked={active}
              onChange={(event) => setActive(event.target.checked)}
            />
          </CardView>
        </div>
      </div>
    </ShowcaseSection>
  );
}
