import { Suspense } from 'react';
import { CommercialAdminScreen } from '@/modules/commercial/CommercialAdminScreen';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: copy.title };
export default function CommercialAdminPage() {
  return (
    <Suspense>
      <CommercialAdminScreen />
    </Suspense>
  );
}
