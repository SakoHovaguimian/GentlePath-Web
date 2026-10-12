'use client';

import { useState } from 'react';
import { Button, Field, Input, SegmentedPanels } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';

const copy = strings.designSystem;
const panels = { edit: 'edit', preview: 'preview' } as const;
export function MotionShowcase() {
  const presentation = usePresentationService();
  const [duration, setDuration] = useState(240);
  const [panel, setPanel] = useState<'edit' | 'preview'>('edit');
  const [draft, setDraft] = useState<string>(copy.draftSample);
  const motion = { durationMs: duration };
  return (
    <ShowcaseSection
      id="motion"
      title={copy.motion}
      description={copy.panelsHint}
      icon="sparkles"
    >
      <SegmentedPanels
        label={copy.panels}
        value={panel}
        onValueChange={setPanel}
        panels={[
          {
            value: panels.edit,
            label: copy.edit,
            content: (
              <Field labelText={copy.draftLabel}>
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </Field>
            ),
          },
          {
            value: panels.preview,
            label: copy.preview,
            content: (
              <p className="m-0 text-lg text-primary wrap-anywhere">
                {draft || copy.draftSample}
              </p>
            ),
          },
        ]}
      />
      <div className="grid gap-3">
        <Field labelText={copy.overlayTiming}>
          <Input
            type="range"
            min={0}
            max={700}
            step={10}
            value={duration}
            aria-valuetext={strings.componentLibrary.milliseconds(duration)}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
        </Field>
        <p className="m-0 text-sm text-tertiary">
          {strings.componentLibrary.milliseconds(duration)}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              void presentation.showToast({
                title: strings.componentLibrary.successTitle,
                description: strings.componentLibrary.localPreviewHint,
                intent: 'success',
                motion,
              })
            }
          >
            {copy.showToast}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              void presentation.showAlert({
                title: copy.showAlert,
                description: copy.timingHint,
                confirmLabel: copy.close,
                cancelLabel: strings.ui.alertModal.cancel,
                motion,
              })
            }
          >
            {copy.showAlert}
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              void presentation.showSheet({
                title: copy.showSheet,
                description: copy.timingHint,
                content: copy.panelsHint,
                confirmLabel: copy.close,
                motion,
              })
            }
          >
            {copy.showSheet}
          </Button>
          <Button variant="ghost" onClick={() => setDuration(240)}>
            {copy.reset}
          </Button>
        </div>
      </div>
    </ShowcaseSection>
  );
}
