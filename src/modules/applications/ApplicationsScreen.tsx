'use client';

import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  DirectoryFilters,
  DirectoryPagination,
  EmptyState,
  Field,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
  Select,
} from '@/components/ui';
import { gentlePathApplicationStrings as copy } from '@/strings';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { useChildren } from '@/modules/portal/hooks';
import { useApplications } from './hooks';
import { ServiceApplicationStatusSchema } from './models/serviceApplicationStatus';
import '@/modules/portal/styles/portal.css';

const allRecordsFilter = '';
const personalRecordsFilter = 'personal';

export function ApplicationsScreen() {
  const directory = usePortalDirectory();
  const params = useSearchParams();
  const child = params.get('child') ?? '';
  const children = useChildren();
  const status = ServiceApplicationStatusSchema.safeParse(directory.status);
  const query = useApplications({
    query: directory.query,
    status: status.success ? status.data : undefined,
    child_id: child && child !== 'personal' ? child : undefined,
    personal_only: child === 'personal',
    limit: 12,
    offset: directory.offset,
  });
  useEffect(() => {
    if (
      query.isSuccess &&
      !query.isFetching &&
      query.data.data.length === 0 &&
      directory.offset > 0
    ) {
      directory.setOffset(Math.max(0, directory.offset - 12));
    }
  }, [query.isSuccess, query.isFetching, query.data, directory]);
  const filtered = Boolean(directory.query || directory.status || child);
  return (
    <Page className="gp-portal-page">
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          <Button asChild>
            <NavigationLink href="/applications/new">
              {copy.newAction}
            </NavigationLink>
          </Button>
        }
      />
      <DirectoryFilters
        id="application-search"
        value={{
          query: directory.query,
          status: status.success ? status.data : undefined,
        }}
        onChange={(value) =>
          directory.update({
            query: value.query,
            status: value.status,
            offset: undefined,
          })
        }
        statuses={ServiceApplicationStatusSchema.options.map((value) => ({
          value,
          label: copy.statuses[value],
        }))}
        copy={{
          search: copy.searchLabel,
          placeholder: copy.searchPlaceholder,
          clear: copy.clearAction,
          status: copy.statusLabel,
          allStatuses: copy.allStatuses,
        }}
        additionalFilters={
          <Field labelText={copy.childLabel}>
            <Select
              value={child}
              onValueChange={(value) =>
                directory.update({ child: value, offset: undefined })
              }
            >
              <option value={allRecordsFilter}>{copy.allChildren}</option>
              <option value={personalRecordsFilter}>
                {copy.personalOption}
              </option>
              {(children.data ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
        }
      />
      <QueryBoundary query={query}>
        {(result) => (
          <div className="grid gap-5">
            {result.data.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {result.data.map((application) => (
                  <Card
                    key={application.id}
                    className="relative grid gap-4 hover:border-brand focus-within:border-brand"
                  >
                    <div className="flex flex-wrap gap-2">
                      <Badge intent="brand">
                        {copy.statuses[application.status]}
                      </Badge>
                      <Badge intent="neutral">
                        {application.child_id
                          ? (children.data?.find(
                              (item) => item.id === application.child_id,
                            )?.name ?? copy.childLabel)
                          : copy.personalOption}
                      </Badge>
                    </div>
                    <h2 className="m-0 font-display text-xl text-primary wrap-anywhere">
                      <NavigationLink
                        className="ui-card-open outline-none"
                        href={`/applications/${application.id}`}
                      >
                        {application.title}
                      </NavigationLink>
                    </h2>
                    <p className="m-0 text-sm text-secondary wrap-anywhere">
                      {application.provider || copy.providerEmpty}
                    </p>
                    {application.applied_on && (
                      <p className="m-0 text-xs text-tertiary">
                        {copy.dateDescription(application.applied_on)}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="file"
                title={filtered ? copy.noResultsTitle : copy.emptyTitle}
                description={filtered ? copy.noResultsHint : copy.emptyHint}
                action={
                  <Button asChild>
                    <NavigationLink href="/applications/new">
                      {copy.newAction}
                    </NavigationLink>
                  </Button>
                }
              />
            )}
            <DirectoryPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              label={copy.paginationLabel}
              range={copy.rangeDescription}
              onNavigate={directory.setOffset}
            />
          </div>
        )}
      </QueryBoundary>
      <p className="m-0 text-sm text-tertiary">{copy.privacy}</p>
    </Page>
  );
}
