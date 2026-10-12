'use client';

import { useEffect, useRef, useState } from 'react';
import { strings } from '@/strings';
import { useReviewedDraftAssistant } from '../useReviewedDraftAssistant';
import type {
  ReviewedDraftAssistantField,
  ReviewedDraftAssistantResult,
} from '../models/reviewedDraftAssistant';
import { FloatingAssistantDialog } from './FloatingAssistantDialog';
import { DraftChatMessage } from './DraftChatMessage';
import { DraftChatReview } from './DraftChatReview';
import { Button } from './Button';
import { Field } from './Field';
import { TextArea } from './TextArea';
import { Message } from './Message';
import { InlineLoading } from './QueryBoundary';

export function ReviewedDraftChat({
  open,
  fields,
  contextKey,
  disabled,
  generate,
  onApply,
  onBusyChange,
  onClose,
  onReturnFocus,
}: {
  open: boolean;
  fields: ReviewedDraftAssistantField[];
  contextKey: string;
  disabled: boolean;
  generate: (
    transcript: string,
    signal: AbortSignal,
  ) => Promise<ReviewedDraftAssistantResult>;
  onApply: (suggestions: Record<string, string>) => void;
  onBusyChange: (busy: boolean) => boolean;
  onClose: () => void;
  onReturnFocus: () => void;
}) {
  const copy = strings.assistantMessages;
  const [introduced, setIntroduced] = useState(false);
  const [messages, setMessages] = useState<
    { user: boolean; content: string }[]
  >([]);
  const sent = useRef('');
  const {
    transcript,
    transcriptRef,
    changeTranscript,
    result,
    resultRef,
    review,
    selected,
    setReview,
    setSelected,
    pending,
    error,
    speech,
    speechBusy,
    stale,
    canApply,
    startDictation,
    run,
    apply,
    discard,
  } = useReviewedDraftAssistant({
    fields,
    contextKey,
    disabled,
    onBusyChange,
    rateLimited: copy.rateLimited,
    selectSuggestions: true,
    generate: async (transcript, signal) => {
      if (sent.current !== transcript) {
        setMessages((current) => [
          ...current,
          { user: true, content: transcript },
        ]);
        sent.current = transcript;
      }
      const response = await generate(transcript, signal);
      if (!signal.aborted)
        setMessages((current) => [
          ...current,
          {
            user: false,
            content: Object.keys(response.suggestions).length
              ? copy.ready
              : copy.needMore,
          },
        ]);
      return response;
    },
    onApply: (suggestions) => {
      onApply(suggestions);
      setMessages([]);
      sent.current = '';
      setIntroduced(false);
      onClose();
    },
  });
  const blocked = disabled || pending || speechBusy;
  useEffect(() => {
    if (!open || introduced) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => setIntroduced(true));
      return () => cancelAnimationFrame(frame);
    }
    const timer = setTimeout(() => setIntroduced(true), 500);
    return () => clearTimeout(timer);
  }, [open, introduced]);
  function decline() {
    discard();
    sent.current = '';
    setMessages([]);
    onClose();
  }
  return (
    <FloatingAssistantDialog
      open={open}
      title={copy.title}
      description={copy.description}
      busy={pending || speechBusy}
      onClose={onClose}
      onReturnFocus={onReturnFocus}
    >
      <div
        role="log"
        aria-label={copy.conversation}
        aria-live="polite"
        className="grid min-w-0 gap-4"
      >
        <DraftChatMessage>{copy.hello}</DraftChatMessage>
        {introduced && <DraftChatMessage>{copy.guidance}</DraftChatMessage>}
        {messages.map((message, index) => (
          <DraftChatMessage key={index} user={message.user}>
            {message.content}
          </DraftChatMessage>
        ))}
        {pending && (
          <DraftChatMessage>
            <InlineLoading message={copy.thinking} />
          </DraftChatMessage>
        )}
      </div>
      {error && <Message intent="danger" title={error} />}
      {result && (
        <DraftChatReview
          resultRef={resultRef}
          review={review}
          selected={selected}
          setReview={setReview}
          setSelected={setSelected}
          result={result}
          stale={stale}
          canApply={canApply}
          apply={apply}
          fields={fields}
          blocked={blocked}
          onDecline={decline}
        />
      )}
      <div className="grid min-w-0 gap-3 border-t border-secondary pt-4">
        <Field labelText={copy.input}>
          <TextArea
            ref={transcriptRef}
            value={transcript}
            maxLength={20000}
            rows={4}
            className="resize-none"
            placeholder={copy.placeholder}
            disabled={blocked}
            aria-describedby="business-chat-help"
            onChange={(event) => changeTranscript(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing &&
                event.keyCode !== 229
              ) {
                event.preventDefault();
                void run();
              }
            }}
          />
        </Field>
        <p id="business-chat-help" className="m-0 text-xs text-tertiary">
          {copy.inputHint}
        </p>
        <div className="flex flex-wrap gap-3">
          {speech.isSupported && (
            <Button
              variant="secondary"
              disabled={disabled || pending || speech.isFinalizingTranscript}
              onClick={
                speech.isStarting || speech.isListening
                  ? () => void speech.stop()
                  : startDictation
              }
            >
              {speech.isStarting
                ? strings.draftAssistant.cancelDictation
                : speech.isListening
                  ? strings.draftAssistant.stopDictation
                  : copy.speak}
            </Button>
          )}
          <Button
            loading={pending}
            disabled={blocked || !transcript.trim()}
            onClick={() => void run()}
          >
            {copy.send}
          </Button>
        </div>
        {!speech.isSupported && (
          <p className="m-0 text-xs text-secondary">
            {strings.draftAssistant.typedInput}
          </p>
        )}
        {speechBusy && (
          <p role="status" className="m-0 text-sm text-secondary">
            {speech.isFinalizingTranscript
              ? strings.draftAssistant.finishing
              : speech.isStarting
                ? strings.draftAssistant.starting
                : strings.draftAssistant.listening}
          </p>
        )}
        {speech.error && <Message intent="warning" title={speech.error} />}
      </div>
    </FloatingAssistantDialog>
  );
}
