import Link from 'next/link';
import { Button, EmptyState, PageHeader } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';

export function AccessDenied() {
  return (
    <div className="grid gap-7">
      <PageHeader title={copy.access.title} />
      <EmptyState
        icon="warning"
        title={copy.access.title}
        description={copy.access.description}
        action={
          <Button asChild>
            <Link href="/dashboard">{copy.access.action}</Link>
          </Button>
        }
      />
    </div>
  );
}
