import Link from 'next/link';
import { Button, EmptyState } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
export default function ArticleNotFound() {
  return (
    <main className="gp-container grid min-h-96 justify-items-center gap-6 py-24">
      <EmptyState
        title={copy.notFoundTitle}
        description={copy.notFoundDescription}
      />
      <Button asChild>
        <Link href="/blog">{copy.backToJournal}</Link>
      </Button>
    </main>
  );
}
