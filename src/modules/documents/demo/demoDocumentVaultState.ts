import type { DemoStoredDocument } from './demoStoredDocument';

export interface DemoDocumentVaultState {
  documents: DemoStoredDocument[];
  uploads: Map<string, string>;
}
