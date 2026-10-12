'use client';

import { strings } from '@/strings';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BrowserSpeechRecognition,
  BrowserSpeechRecognitionEvent,
  BrowserSpeechWindow,
} from '@/models/browserSpeechRecognition';

const TranscriptSettlementTimeoutMilliseconds = 3_000;

export function useBrowserSpeechRecognition(
  onTranscript: (transcript: string) => void,
) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptHandlerRef = useRef(onTranscript);
  const startedRef = useRef(false);
  const settlementTimerRef = useRef<number | null>(null);
  const settlementResolverRef = useRef<(() => void) | null>(null);
  const settlementPromiseRef = useRef<Promise<void> | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isFinalizingTranscript, setIsFinalizingTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finishTranscriptSettlement = useCallback(() => {
    if (settlementTimerRef.current !== null) {
      window.clearTimeout(settlementTimerRef.current);
      settlementTimerRef.current = null;
    }
    settlementResolverRef.current?.();
    settlementResolverRef.current = null;
    settlementPromiseRef.current = null;
    setIsFinalizingTranscript(false);
  }, []);

  useEffect(() => {
    transcriptHandlerRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const browserWindow = window as BrowserSpeechWindow;
    const supportTimer = window.setTimeout(() => {
      setIsSupported(
        Boolean(
          browserWindow.SpeechRecognition ??
          browserWindow.webkitSpeechRecognition,
        ),
      );
    }, 0);

    return () => {
      window.clearTimeout(supportTimer);
      if (settlementTimerRef.current !== null)
        window.clearTimeout(settlementTimerRef.current);
      settlementResolverRef.current?.();
      const recognition = recognitionRef.current;
      recognitionRef.current = null;
      if (recognition) {
        recognition.onstart = null;
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.abort();
      }
    };
  }, []);

  const start = useCallback(() => {
    if (recognitionRef.current) return;

    const browserWindow = window as BrowserSpeechWindow;
    const Recognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setError(strings.draftAssistant.unsupported);
      return;
    }

    const recognition = new Recognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    recognition.onstart = () => {
      if (recognitionRef.current !== recognition) return;
      startedRef.current = true;
      setIsStarting(false);
      setError(null);
      setIsListening(true);
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      setIsStarting(false);
      setIsListening(false);
      finishTranscriptSettlement();
    };
    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;
      recognitionRef.current = null;
      recognition.abort();
      setIsStarting(false);
      setIsListening(false);
      finishTranscriptSettlement();
      setError(
        event.error === 'not-allowed'
          ? strings.draftAssistant.blocked
          : strings.draftAssistant.stopped,
      );
    };
    recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
      if (recognitionRef.current !== recognition) return;
      const completedSegments: string[] = [];

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];

        if (result.isFinal) {
          completedSegments.push(result[0].transcript.trim());
        }
      }

      const completedTranscript = completedSegments.filter(Boolean).join(' ');

      if (completedTranscript) {
        transcriptHandlerRef.current(completedTranscript);
      }
    };

    recognitionRef.current = recognition;
    startedRef.current = false;
    setError(null);
    setIsStarting(true);

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsStarting(false);
      setIsListening(false);
      setError(strings.draftAssistant.couldNotStart);
    }
  }, [finishTranscriptSettlement]);

  const stop = useCallback((): Promise<void> => {
    const recognition = recognitionRef.current;
    if (!recognition) return Promise.resolve();
    if (!startedRef.current) {
      recognitionRef.current = null;
      recognition.abort();
      setIsStarting(false);
      setIsListening(false);
      return Promise.resolve();
    }
    if (settlementPromiseRef.current) return settlementPromiseRef.current;

    setIsFinalizingTranscript(true);
    const settlementPromise = new Promise<void>((resolve) => {
      settlementResolverRef.current = resolve;
      settlementTimerRef.current = window.setTimeout(() => {
        // A stalled service must not append a late result after review resumes.
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
          recognition.abort();
          setIsStarting(false);
          setIsListening(false);
          setError(strings.draftAssistant.stopped);
        }
        finishTranscriptSettlement();
      }, TranscriptSettlementTimeoutMilliseconds);
    });
    settlementPromiseRef.current = settlementPromise;
    try {
      recognition.stop();
    } catch {
      recognitionRef.current = null;
      recognition.abort();
      setIsStarting(false);
      setIsListening(false);
      finishTranscriptSettlement();
    }
    return settlementPromise;
  }, [finishTranscriptSettlement]);

  return {
    isSupported,
    isStarting,
    isListening,
    isFinalizingTranscript,
    error,
    start,
    stop,
  };
}
