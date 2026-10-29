import type { Metadata } from 'next';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { GuidesScreen } from '@/modules/editorial/GuidesScreen';
import { editorialQueryFromSearch } from '@/modules/editorial/models/editorialQuery';

export const metadata: Metadata = { title: copy.guidesTitle };
export default async function GuidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <GuidesScreen query={editorialQueryFromSearch(await searchParams)} />;
}
