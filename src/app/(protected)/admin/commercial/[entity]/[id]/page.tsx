import { notFound } from 'next/navigation';
import { CommercialEditorScreen } from '@/modules/commercial/CommercialEditorScreen';
import { CommercialEntitySchema } from '@/modules/commercial/models/commercialEntity';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: copy.edit };
export default async function CommercialDetailPage({
  params,
}: {
  params: Promise<{ entity: string; id: string }>;
}) {
  const { entity, id } = await params;
  const parsed = CommercialEntitySchema.safeParse(entity);
  if (!parsed.success) notFound();
  return <CommercialEditorScreen entity={parsed.data} id={id} />;
}
