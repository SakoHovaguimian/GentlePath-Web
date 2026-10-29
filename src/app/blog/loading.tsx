import { InlineLoading } from '@/components/ui';
import { gentlePathBlogStrings as copy } from '@/strings';

export default function BlogLoading() {
  return (
    <main className="gp-container min-h-96 py-24">
      <InlineLoading message={copy.loadingTitle} />
    </main>
  );
}
