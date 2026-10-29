import type { Metadata } from 'next';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { ResourceEditorScreen } from '@/modules/editorial/ResourceEditorScreen';

export const metadata: Metadata = { title: copy.editResource };
export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ResourceEditorScreen id={(await params).id} />;
}
