'use client';

import { useState } from 'react';
import { Page, PageHeader, QueryBoundary } from '@/components/ui';
import { DomainError } from '@/errors/domainErrors';
import { gentlePathApplicationStrings as copy } from '@/strings';
import { MutationError } from '@/modules/portal/components/MutationError';
import { useApplication } from './hooks';
import { ApplicationEditor } from './components/ApplicationEditor';
import '@/modules/portal/styles/portal.css';

export function NewApplicationScreen({ programKey }: { programKey?: string }) {
  return (
    <Page className="gp-portal-page">
      <PageHeader title={copy.newAction} description={copy.formDescription} />
      <ApplicationEditor programKey={programKey} />
    </Page>
  );
}

export function ApplicationEditorScreen({ id }: { id: string }) {
  const query = useApplication(id);
  const [revision, setRevision] = useState(0);
  const authoritative =
    query.error instanceof DomainError &&
    [401, 403, 404].includes(query.error.status);
  const editor =
    query.data && !authoritative ? (
      <>
        <MutationError error={query.error} />
        <ApplicationEditor
          key={`${id}:${revision}`}
          application={query.data}
          onReload={async () => {
            const result = await query.refetch();
            if (result.isSuccess) setRevision((value) => value + 1);
          }}
        />
      </>
    ) : (
      <QueryBoundary query={query}>
        {(application) => <ApplicationEditor application={application} />}
      </QueryBoundary>
    );
  return (
    <Page className="gp-portal-page">
      <PageHeader title={copy.editAction} description={copy.formDescription} />
      {editor}
    </Page>
  );
}
