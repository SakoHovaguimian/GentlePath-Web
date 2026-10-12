import type { BrowserSpeechRecognitionConstructor } from './browserSpeechRecognitionConstructor';
export interface BrowserSpeechWindow extends Window {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
}
