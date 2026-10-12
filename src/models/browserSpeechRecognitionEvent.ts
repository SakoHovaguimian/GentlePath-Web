import type { BrowserSpeechRecognitionResult } from './browserSpeechRecognitionResult';
export interface BrowserSpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: ArrayLike<BrowserSpeechRecognitionResult>;
}
