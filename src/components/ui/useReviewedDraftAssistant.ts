'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useBrowserSpeechRecognition } from '@/providers/useBrowserSpeechRecognition';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { ApiError } from '@/errors/domainErrors';
import { strings } from '@/strings';
import type {
  ReviewedDraftAssistantField,
  ReviewedDraftAssistantResult,
} from './models/reviewedDraftAssistant';

export function useReviewedDraftAssistant({
  fields,
  contextKey,
  disabled,
  generate,
  onApply,
  onBusyChange,
  rateLimited,
  selectSuggestions = false,
}: {
  fields: ReviewedDraftAssistantField[];
  contextKey: string;
  disabled: boolean;
  generate: (
    transcript: string,
    signal: AbortSignal,
  ) => Promise<ReviewedDraftAssistantResult>;
  onApply: (suggestions: Record<string, string>) => void;
  onBusyChange: (busy: boolean) => boolean;
  rateLimited: string;
  selectSuggestions?: boolean;
}) {
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<ReviewedDraftAssistantResult>();
  const [review, setReview] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [basis, setBasis] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const dirty = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLTextAreaElement>(null);
  const operation = useRef<'speech' | 'generation' | null>(null);
  const [dictationAttempt, setDictationAttempt] = useState(0);
  const appendDictation = useCallback((text: string) => {
    dirty.current = true;
    setTranscript(
      (current) => `${current.trim()}${current.trim() ? ' ' : ''}${text}`,
    );
    setResult(undefined);
    setError('');
  }, []);
  const speech = useBrowserSpeechRecognition(appendDictation);
  const { stop } = speech;
  useUnsavedFormGuard(dirty, busy);
  const speechBusy =
    speech.isStarting || speech.isListening || speech.isFinalizingTranscript;
  const stale = Boolean(result && basis !== contextKey);

  useEffect(() => {
    // A changed target/context invalidates a running request, even when its
    // response arrives after cancellation. Existing review stays visibly stale.
    return () => controller.current?.abort();
  }, [contextKey, disabled]);
  useEffect(() => {
    if (disabled) void stop();
  }, [disabled, stop]);
  useEffect(() => {
    if (operation.current === 'speech' && !speechBusy) {
      operation.current = null;
      busy.current = false;
      onBusyChange(false);
    }
  }, [dictationAttempt, speechBusy, speech.error, onBusyChange]);
  useEffect(
    () => () => {
      controller.current?.abort();
      if (busy.current) onBusyChange(false);
      busy.current = false;
    },
    [onBusyChange],
  );

  function reserve() {
    if (disabled || busy.current || !onBusyChange(true)) return false;
    busy.current = true;
    return true;
  }
  function startDictation() {
    if (!reserve()) return;
    dirty.current = true;
    operation.current = 'speech';
    // An attempt must render even if recognition fails synchronously with the
    // same error as before, so that its parent reservation is always released.
    setDictationAttempt((attempt) => attempt + 1);
    setResult(undefined);
    speech.start();
  }
  function changeTranscript(value: string) {
    if (disabled || pending || speechBusy) return;
    dirty.current = Boolean(value);
    setTranscript(value);
    setResult(undefined);
    setError('');
  }
  async function run() {
    if (
      !transcript.trim() ||
      transcript.length > 20000 ||
      speechBusy ||
      !reserve()
    )
      return;
    operation.current = 'generation';
    const active = new AbortController();
    controller.current = active;
    const snapshot = contextKey;
    setPending(true);
    setError('');
    setResult(undefined);
    try {
      const response = await generate(transcript.trim(), active.signal);
      if (active.signal.aborted) return;
      setResult(response);
      setReview(
        Object.fromEntries(
          fields.flatMap((field) => {
            const value = response.suggestions[field.key];
            return typeof value === 'string' ? [[field.key, value]] : [];
          }),
        ),
      );
      setSelected(
        selectSuggestions
          ? Object.fromEntries(
              fields
                .filter(
                  (field) =>
                    typeof response.suggestions[field.key] === 'string',
                )
                .map((field) => [field.key, true]),
            )
          : {},
      );
      setBasis(snapshot);
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch (cause) {
      if (!active.signal.aborted)
        setError(
          cause instanceof ApiError && cause.status === 429
            ? rateLimited
            : strings.draftAssistant.failed,
        );
    } finally {
      if (controller.current === active) {
        controller.current = null;
        operation.current = null;
        busy.current = false;
        onBusyChange(false);
        setPending(false);
      }
    }
  }
  function apply() {
    if (disabled || pending || speechBusy || stale) return;
    const suggestions = Object.fromEntries(
      fields.flatMap((field) => {
        const value = review[field.key];
        return selected[field.key] &&
          typeof value === 'string' &&
          value.trim() &&
          value.length <= field.maxLength &&
          (!field.validate || field.validate(value.trim()))
          ? [[field.key, value.trim()]]
          : [];
      }),
    );
    if (!Object.keys(suggestions).length) return;
    onApply(suggestions);
    setResult(undefined);
    setTranscript('');
    dirty.current = false;
    requestAnimationFrame(() => transcriptRef.current?.focus());
  }
  function discard() {
    if (pending || speechBusy) return;
    setResult(undefined);
    setTranscript('');
    setError('');
    dirty.current = false;
    requestAnimationFrame(() => transcriptRef.current?.focus());
  }
  const canApply =
    fields.some((field) => selected[field.key] && review[field.key]?.trim()) &&
    fields.every(
      (field) =>
        !selected[field.key] ||
        (Boolean(review[field.key]?.trim()) &&
          review[field.key].length <= field.maxLength &&
          (!field.validate || field.validate(review[field.key].trim()))),
    );

  return {
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
  };
}
