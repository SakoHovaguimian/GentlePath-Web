'use client';

import {
  Button,
  DescriptionList,
  FormActions,
  SectionCard,
  SectionCardView,
  UiIcon,
  type IconName,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';
const copy = strings.componentLibrary;
const sections: { title: string; description: string; icon: IconName }[] = [
  {
    title: copy.basicDetails,
    description: copy.basicDetailsHint,
    icon: 'home',
  },
  {
    title: copy.classification,
    description: copy.classificationHint,
    icon: 'tag',
  },
  {
    title: copy.merchandising,
    description: copy.merchandisingHint,
    icon: 'bag',
  },
  {
    title: copy.descriptionLabel,
    description: copy.sampleDescription,
    icon: 'file',
  },
  {
    title: copy.paymentDetails,
    description: copy.paymentDetailsHint,
    icon: 'card',
  },
];
export function SectionsShowcase() {
  const presentation = usePresentationService();
  return (
    <ShowcaseSection
      id="sections"
      title={copy.formSections}
      description={copy.formSectionsHint}
      icon="file"
    >
      <div className="grid gap-2">
        {sections.map((section) => (
          <SectionCardView
            key={section.icon}
            {...section}
            icon={<UiIcon name={section.icon} />}
            className="p-3"
            onClick={() => {
              void presentation.showSheet({
                title: section.title,
                description: section.description,
                confirmLabel: copy.close,
                cancelLabel: copy.cancel,
              });
            }}
          />
        ))}
      </div>
      <SectionCard
        id="preview-section-card"
        title={copy.basicDetails}
        description={copy.basicDetailsHint}
        icon={<UiIcon name="store" />}
      >
        <DescriptionList
          items={[
            { label: strings.sampleFields.name, value: copy.sampleBrand },
            {
              label: strings.sampleCatalog.categories,
              value: copy.categoryLabels.flower,
            },
          ]}
        />
      </SectionCard>
      <FormActions sticky={false} description={copy.localPreviewHint}>
        <Button
          onClick={() =>
            void presentation.showToast({
              title: copy.successTitle,
              intent: 'success',
            })
          }
        >
          {copy.create}
        </Button>
      </FormActions>
    </ShowcaseSection>
  );
}
