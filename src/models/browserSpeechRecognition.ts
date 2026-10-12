import type { BrowserSpeechRecognitionEvent } from './browserSpeechRecognitionEvent';
import type { BrowserSpeechRecognitionErrorEvent } from './browserSpeechRecognitionErrorEvent';
export interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
export type { BrowserSpeechRecognitionConstructor } from './browserSpeechRecognitionConstructor';
export type { BrowserSpeechRecognitionEvent } from './browserSpeechRecognitionEvent';
export type { BrowserSpeechRecognitionResult } from './browserSpeechRecognitionResult';
export type { BrowserSpeechRecognitionErrorEvent } from './browserSpeechRecognitionErrorEvent';
export type { BrowserSpeechWindow } from './browserSpeechWindow';
