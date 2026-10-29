'use client';
import { ErrorState } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';
export default function BlogError({ reset }: { reset: () => void }) {
  return (
    <main className="gp-container min-h-96 py-24">
      <ErrorState
        title={copy.articleUnavailableTitle}
        description={copy.articleUnavailableDescription}
        onRetry={reset}
      />
    </main>
  );
}
