'use client';

import { QueryBoundary } from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { useGuide } from './hooks';
import { GuideEditor } from './components/GuideEditor';

export function GuideEditorScreen({ id }: { id?: string }) {
  const query = useGuide(id);
  if (!id) return <GuideEditor />;
  return (
    <QueryBoundary
      query={query}
      loadingMessage={copy.loadingLabel}
      showError={!query.data}
    >
      {(guide) => <GuideEditor key={guide.id} initialGuide={guide} />}
    </QueryBoundary>
  );
}
