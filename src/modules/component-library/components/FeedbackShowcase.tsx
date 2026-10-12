'use client';

import { useState } from 'react';
import { Button, InfoPopover, Message, Tooltip, UiIcon } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';
const copy = strings.componentLibrary;
const messages = [
  {
    intent: 'success',
    title: copy.successTitle,
    description: copy.successHint,
  },
  {
    intent: 'warning',
    title: copy.warningTitle,
    description: copy.warningHint,
  },
  {
    intent: 'danger',
    title: copy.errorTitle,
    description: copy.errorDescription,
  },
  { intent: 'info', title: copy.infoTitle, description: copy.infoHint },
] as const;

export function FeedbackShowcase() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const presentation = usePresentationService();
  const toast = () => {
    void presentation.showToast({
      title: copy.successTitle,
      description: copy.actionPreviewHint,
      intent: 'success',
    });
  };
  return (
    <ShowcaseSection
      id="feedback"
      title={copy.feedback}
      description={copy.feedbackHint}
      icon="info"
    >
      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="grid gap-3">
          {messages
            .filter((message) => !dismissed.includes(message.intent))
            .map((message) => (
              <Message
                key={message.intent}
                {...message}
                role="note"
                onDismiss={() =>
                  setDismissed((current) => [...current, message.intent])
                }
              />
            ))}
          {dismissed.length > 0 && (
            <Button variant="ghost" onClick={() => setDismissed([])}>
              {copy.restoreMessages}
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={toast}>
              {copy.toast}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void presentation.showAlert({
                  title: copy.deleteTitle,
                  description: copy.deleteHint,
                  confirmLabel: copy.confirmPreview,
                  cancelLabel: copy.keepPreview,
                  tone: 'danger',
                });
              }}
            >
              {copy.alert}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void presentation.showSheet({
                  title: copy.sheetTitle,
                  description: copy.sheetHint,
                  content: copy.sheetContent,
                  confirmLabel: copy.close,
                  cancelLabel: copy.cancel,
                });
              }}
            >
              {copy.sheet}
            </Button>
          </div>
        </div>
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Tooltip label={copy.tooltip} content={copy.tooltipHint}>
              <UiIcon name="info" />
              {copy.tooltip}
            </Tooltip>
            <InfoPopover label={copy.popover}>{copy.tooltipHint}</InfoPopover>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}
