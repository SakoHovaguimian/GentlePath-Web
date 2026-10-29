import type { Metadata } from 'next';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { AdminResourcesScreen } from '@/modules/editorial/AdminResourcesScreen';
import { editorialQueryFromSearch } from '@/modules/editorial/models/editorialQuery';

export const metadata: Metadata = { title: copy.resourcesTitle };
export default async function AdminResourcesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <AdminResourcesScreen
      query={editorialQueryFromSearch(await searchParams)}
    />
  );
}
