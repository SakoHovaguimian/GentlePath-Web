import { Suspense } from 'react';
import { DiscountsScreen } from '@/modules/commercial/DiscountsScreen';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: copy.discountsTitle };
export default function DiscountsPage() {
  return (
    <Suspense>
      <DiscountsScreen />
    </Suspense>
  );
}
