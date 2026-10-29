import type { Metadata } from 'next';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { ResourceEditorScreen } from '@/modules/editorial/ResourceEditorScreen';

export const metadata: Metadata = { title: copy.newResource };
export default async function NewResourcePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parentId = (await searchParams).parent_id;
  return (
    <ResourceEditorScreen
      parentId={typeof parentId === 'string' ? parentId : undefined}
    />
  );
}
