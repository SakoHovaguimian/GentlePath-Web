import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, buttonClassName } from '@/components/ui';
import { strings } from '@/strings';
export const metadata: Metadata = { title: strings.errors.notFound };
export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <Card className="grid gap-4">
        <h1 className="text-2xl font-semibold">{strings.errors.notFound}</h1>
        <Link href="/dashboard" className={buttonClassName()}>
          {strings.app.backToWorkspace}
        </Link>
      </Card>
    </main>
  );
}
