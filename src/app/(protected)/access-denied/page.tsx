import type { Metadata } from 'next';
import { AccessDenied } from '@/components/AccessDenied';
import { gentlePathPortalStrings as copy } from '@/strings';
export const metadata: Metadata = { title: copy.access.title };
export default function AccessDeniedPage() {
  return <AccessDenied />;
}
