'use client';

import { useState } from 'react';
import { DomainError } from '@/errors/domainErrors';
import { MutationError } from '@/modules/portal/components/MutationError';
import {
  Badge,
  Button,
  Card,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathApplicationStrings as copy } from '@/strings';
import { useApplication } from './hooks';
import { FollowUpEditor } from './components/FollowUpEditor';
import { FollowUpRow } from './components/FollowUpRow';
import '@/modules/portal/styles/portal.css';

export function ApplicationDetailScreen({ id }: { id: string }) {
  const query = useApplication(id);
  const [adding, setAdding] = useState(false);
  const authoritative =
    query.error instanceof DomainError &&
    [401, 403, 404].includes(query.error.status);
  return (
    <Page className="gp-portal-page">
      <QueryBoundary query={query} showError={!query.data || authoritative}>
        {(application) => (
          <>
            <MutationError error={query.error} />
            <PageHeader
              title={application.title}
              description={application.provider || copy.providerEmpty}
              action={
                <Button asChild>
                  <NavigationLink href={`/applications/${id}/edit`}>
                    {copy.editAction}
                  </NavigationLink>
                </Button>
              }
            />
            <div>
              <Button asChild variant="ghost">
                <NavigationLink href="/applications">
                  {copy.backAction}
                </NavigationLink>
              </Button>
            </div>
            <Card className="grid gap-5">
              <div>
                <Badge intent="brand">
                  {copy.statuses[application.status]}
                </Badge>
              </div>
              <dl className="m-0 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-tertiary">{copy.appliedLabel}</dt>
                  <dd className="m-0 mt-1 text-sm text-primary">
                    {application.applied_on
                      ? copy.dateDescription(application.applied_on)
                      : copy.appliedEmpty}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-tertiary">
                    {copy.referenceLabel}
                  </dt>
                  <dd className="m-0 mt-1 text-sm text-primary wrap-anywhere">
                    {application.reference || copy.referenceEmpty}
                  </dd>
                </div>
              </dl>
              {application.benefit_program_name && (
                <div>
                  <h2 className="m-0 text-sm text-tertiary">
                    {copy.programLabel}
                  </h2>
                  <p className="text-sm text-primary">
                    {application.benefit_program_name}
                  </p>
                  {application.benefit_program_url && (
                    <Button asChild variant="secondary">
                      <a
                        href={application.benefit_program_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {copy.programAction}
                      </a>
                    </Button>
                  )}
                </div>
              )}
              <div>
                <h2 className="m-0 text-sm text-tertiary">{copy.notesLabel}</h2>
                <p className="mb-0 whitespace-pre-wrap text-sm text-primary wrap-anywhere">
                  {application.notes || copy.notesEmpty}
                </p>
              </div>
            </Card>
            <Card className="grid gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="m-0 font-display text-xl text-primary">
                    {copy.followUpsTitle}
                  </h2>
                  <p className="mb-0 mt-2 text-sm text-secondary">
                    {copy.followUpsDescription}
                  </p>
                </div>
                <Button onClick={() => setAdding(true)}>
                  {copy.followUpAdd}
                </Button>
              </div>
              {application.follow_ups.length ? (
                <div>
                  {application.follow_ups.map((followUp) => (
                    <FollowUpRow key={followUp.id} followUp={followUp} />
                  ))}
                </div>
              ) : (
                <p className="m-0 text-sm text-secondary">
                  {copy.followUpsEmpty}
                </p>
              )}
            </Card>
            <p className="m-0 text-sm text-tertiary">{copy.privacy}</p>
            {adding && (
              <FollowUpEditor
                applicationId={application.id}
                onClose={() => setAdding(false)}
              />
            )}
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
