'use client';

import { strings } from '@/strings';
import { useReviewedDraftAssistant } from '../useReviewedDraftAssistant';
import type {
  ReviewedDraftAssistantField,
  ReviewedDraftAssistantResult,
} from '../models/reviewedDraftAssistant';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Field } from './Field';
import { Message } from './Message';
import { FloatingAssistant } from './FloatingAssistant';
import { TextArea } from './TextArea';

interface ReviewedDraftAssistantProps {
  id: string;
  title: string;
  description: string;
  fields: ReviewedDraftAssistantField[];
  contextKey: string;
  disabled: boolean;
  generate: (
    transcript: string,
    signal: AbortSignal,
  ) => Promise<ReviewedDraftAssistantResult>;
  onApply: (suggestions: Record<string, string>) => void;
  onBusyChange: (busy: boolean) => boolean;
  questionsLabel: string;
  warningsLabel: string;
  rateLimited: string;
  transcriptPlaceholder?: string;
}

export function ReviewedDraftAssistant({
  id,
  title,
  description,
  fields,
  contextKey,
  disabled,
  generate,
  onApply,
  onBusyChange,
  questionsLabel,
  warningsLabel,
  rateLimited,
  transcriptPlaceholder,
}: ReviewedDraftAssistantProps) {
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
    generate,
    onApply,
    onBusyChange,
    rateLimited,
  });
  const copy = strings.draftAssistant;
  const blocked = disabled || pending || speechBusy;
  return (
    <FloatingAssistant
      id={id}
      title={title}
      description={description}
      disabled={disabled}
      busy={pending || speechBusy}
    >
      <div className="grid gap-2">
        <p className="m-0 text-sm font-semibold text-primary">{copy.voice}</p>
        <p className="m-0 text-xs text-tertiary">{copy.voiceHint}</p>
        {speech.isSupported ? (
          <div className="flex flex-wrap gap-2">
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
                ? copy.cancelDictation
                : speech.isListening
                  ? copy.stopDictation
                  : copy.startDictation}
            </Button>
          </div>
        ) : (
          <p className="m-0 text-xs text-secondary">{copy.typedInput}</p>
        )}
        {speechBusy && (
          <p role="status" className="m-0 text-sm text-secondary">
            {speech.isFinalizingTranscript
              ? copy.finishing
              : speech.isStarting
                ? copy.starting
                : copy.listening}
          </p>
        )}
        {speech.error && <Message intent="warning" title={speech.error} />}
      </div>
      <Field labelText={copy.transcript}>
        <TextArea
          ref={transcriptRef}
          value={transcript}
          maxLength={20000}
          rows={5}
          className="resize-none"
          placeholder={transcriptPlaceholder}
          disabled={blocked}
          aria-describedby={`${id}-transcript-help`}
          onChange={(event) => changeTranscript(event.target.value)}
        />
      </Field>
      <p id={`${id}-transcript-help`} className="m-0 text-xs text-tertiary">
        {copy.transcriptHint}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          loading={pending}
          disabled={blocked || !transcript.trim() || transcript.length > 20000}
          onClick={() => void run()}
        >
          {copy.generate}
        </Button>
        {(transcript || result) && (
          <Button
            variant="destructive"
            disabled={pending || speechBusy}
            onClick={discard}
          >
            {copy.discard}
          </Button>
        )}
      </div>
      {error && <Message intent="danger" title={error} />}
      {result && (
        <div
          ref={resultRef}
          tabIndex={-1}
          className="grid min-w-0 gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <p className="m-0 text-sm text-secondary">{copy.review}</p>
          {fields
            .filter((field) => field.key in review)
            .map((field) => (
              <div key={field.key} className="grid min-w-0 gap-2">
                <Checkbox
                  label={field.label}
                  checked={Boolean(selected[field.key])}
                  disabled={blocked || stale}
                  onChange={(event) =>
                    setSelected((current) => ({
                      ...current,
                      [field.key]: event.target.checked,
                    }))
                  }
                />
                <TextArea
                  aria-label={field.label}
                  value={review[field.key]}
                  maxLength={field.maxLength}
                  rows={field.rows ?? 2}
                  className="resize-none"
                  disabled={blocked || stale}
                  onChange={(event) =>
                    setReview((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}
          {!Object.keys(review).length && (
            <Message intent="info" title={copy.noSuggestions} />
          )}
          {result.questions?.length ? (
            <div className="grid gap-2">
              <p className="m-0 text-sm font-semibold text-primary">
                {questionsLabel}
              </p>
              <ul className="m-0 grid gap-2 pl-5 text-sm text-secondary">
                {result.questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {result.warnings?.length ? (
            <div className="grid gap-2">
              <p className="m-0 text-sm font-semibold text-primary">
                {warningsLabel}
              </p>
              <ul className="m-0 grid gap-2 pl-5 text-sm text-secondary">
                {result.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {stale && <Message intent="warning" title={copy.changed} />}
          <div className="flex flex-wrap gap-2">
            <Button disabled={blocked || stale || !canApply} onClick={apply}>
              {copy.apply}
            </Button>
          </div>
        </div>
      )}
    </FloatingAssistant>
  );
}
