import type { Metadata } from 'next';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { AdminGuidesScreen } from '@/modules/editorial/AdminGuidesScreen';
import { editorialQueryFromSearch } from '@/modules/editorial/models/editorialQuery';

export const metadata: Metadata = { title: copy.adminGuidesTitle };
export default async function AdminGuidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <AdminGuidesScreen query={editorialQueryFromSearch(await searchParams)} />
  );
}
