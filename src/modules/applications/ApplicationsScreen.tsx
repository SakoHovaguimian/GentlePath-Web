'use client';

import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';
import {
  Button,
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
import { ApplicationCard } from './components/ApplicationCard';
import './styles/applications.css';
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
        eyebrow={copy.trackerEyebrow}
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
              <div
                className="gp-applications-grid"
                data-single={result.data.length === 1 || undefined}
              >
                {result.data.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    childName={
                      children.data?.find(
                        (item) => item.id === application.child_id,
                      )?.name
                    }
                  />
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
