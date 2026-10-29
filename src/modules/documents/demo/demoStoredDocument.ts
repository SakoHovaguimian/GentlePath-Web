import type { CareDocument } from '../models/careDocument';

export interface DemoStoredDocument {
  metadata: CareDocument;
  contentBase64: string;
}
