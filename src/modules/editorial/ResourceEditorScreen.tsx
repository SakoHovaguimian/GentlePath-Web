'use client';

import { QueryBoundary } from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { useEditorialCollections, useEditorialResource } from './hooks';
import { ResourceEditor } from './components/ResourceEditor';

export function ResourceEditorScreen({
  id,
  parentId,
}: {
  id?: string;
  parentId?: string;
}) {
  const resource = useEditorialResource(id);
  const collections = useEditorialCollections();
  return (
    <QueryBoundary
      query={collections}
      loadingMessage={copy.loadingLabel}
      showError={!collections.data}
    >
      {(data) =>
        id ? (
          <QueryBoundary
            query={resource}
            loadingMessage={copy.loadingLabel}
            showError={!resource.data}
          >
            {(item) => (
              <ResourceEditor
                key={item.id}
                initialResource={item}
                collections={data}
              />
            )}
          </QueryBoundary>
        ) : (
          <ResourceEditor collections={data} parentId={parentId} />
        )
      }
    </QueryBoundary>
  );
}
