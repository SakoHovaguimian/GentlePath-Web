import type { Metadata } from 'next';
import { ApplicationEditorScreen } from '@/modules/applications/ApplicationEditorScreen';
import { gentlePathApplicationStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.editAction };
export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ApplicationEditorScreen id={id} />;
}
