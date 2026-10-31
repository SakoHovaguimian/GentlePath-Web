import type { Metadata } from 'next';
import { NewApplicationScreen } from '@/modules/applications/ApplicationEditorScreen';
import { gentlePathApplicationStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.newAction };
export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string }>;
}) {
  const { program } = await searchParams;
  return <NewApplicationScreen programKey={program} />;
}
