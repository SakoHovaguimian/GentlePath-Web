import { notFound } from 'next/navigation';
import { CommercialEditorScreen } from '@/modules/commercial/CommercialEditorScreen';
import { CommercialEntitySchema } from '@/modules/commercial/models/commercialEntity';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: copy.create };
export default async function CommercialCreatePage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const parsed = CommercialEntitySchema.safeParse((await params).entity);
  if (!parsed.success) notFound();
  return <CommercialEditorScreen entity={parsed.data} />;
}
