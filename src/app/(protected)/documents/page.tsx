import type { Metadata } from 'next';
import { DocumentVaultScreen } from '@/modules/documents/DocumentVaultScreen';
import { gentlePathDocumentStrings as copy } from '@/strings';

export const metadata: Metadata = { title: copy.title };

export default function DocumentsPage() {
  return <DocumentVaultScreen />;
}
