'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Badge,
  Button,
  DataPanel,
  DataTable,
  DirectoryFilters,
  DirectoryPagination,
  EmptyState,
  Field,
  MobileRecordRow,
  Page,
  PageHeader,
  QueryBoundary,
  Select,
} from '@/components/ui';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { useCommercialList } from './hooks';
import {
  CommercialEntitySchema,
  type CommercialEntity,
  type CommercialRecord,
} from './models/commercialEntity';
import { commercialName } from './components/commercialFormFields';
import { CommercialServing } from './components/CommercialServing';
import { CommercialMetrics } from './components/CommercialMetrics';
export function CommercialAdminScreen() {
  const params = useSearchParams();
  const directory = usePortalDirectory();
  const tab = params.get('tab') ?? 'sponsors';
  const parsed = CommercialEntitySchema.safeParse(tab);
  const selected = parsed.success
    ? parsed.data
    : tab === 'metrics' || tab === 'preview'
      ? tab
      : 'sponsors';
  const choices = [
    'sponsors',
    'offers',
    'campaigns',
    'creatives',
    'placements',
    'metrics',
    'preview',
  ] as const;
  return (
    <Page>
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          CommercialEntitySchema.safeParse(selected).success ? (
            <Button asChild>
              <Link href={`/admin/commercial/${selected}/new`}>
                {copy.create}
              </Link>
            </Button>
          ) : undefined
        }
      />
      <Field labelText={copy.title}>
        <Select
          value={selected}
          onValueChange={(value) =>
            directory.update({
              tab: value,
              query: undefined,
              status: undefined,
              offset: undefined,
            })
          }
        >
          {choices.map((value) => (
            <option key={value} value={value}>
              {copy[value]}
            </option>
          ))}
        </Select>
      </Field>
      {selected === 'preview' ? (
        <CommercialServing preview />
      ) : selected === 'metrics' ? (
        <CommercialMetrics />
      ) : (
        <CommercialDirectory key={selected} entity={selected} />
      )}
    </Page>
  );
}
function statusLabel(record: CommercialRecord) {
  if ('status' in record) return copy.statuses[record.status];
  if ('review_status' in record) return copy.statuses[record.review_status];
  return 'is_enabled' in record && record.is_enabled
    ? copy.statuses.enabled
    : copy.statuses.disabled;
}
function CommercialDirectory({ entity }: { entity: CommercialEntity }) {
  const directory = usePortalDirectory();
  const query = useCommercialList(entity, {
    query: directory.query,
    offset: directory.offset,
    ...(directory.status
      ? entity === 'sponsors'
        ? { status: directory.status }
        : entity === 'placements'
          ? { is_enabled: directory.status === 'enabled' }
          : { review_status: directory.status }
      : {}),
  });
  useEffect(() => {
    if (
      query.data &&
      !query.data.data.length &&
      query.data.page.offset > 0 &&
      !query.isFetching
    )
      directory.setOffset(
        Math.max(0, query.data.page.offset - query.data.page.limit),
      );
  }, [query.data, query.isFetching, directory]);
  const statuses =
    entity === 'sponsors'
      ? ['PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED']
      : entity === 'placements'
        ? ['enabled', 'disabled']
        : ['PENDING', 'APPROVED', 'REJECTED'];
  return (
    <DataPanel
      busy={query.isFetching}
      busyLabel={copy.loadingTitle}
      toolbar={
        <DirectoryFilters
          id="commercial-search"
          value={{
            query: directory.query,
            status: directory.status || undefined,
          }}
          onChange={(value) =>
            directory.update({
              query: value.query,
              status: value.status,
              offset: undefined,
            })
          }
          statuses={statuses.map((value) => ({
            value,
            label: copy.statuses[value as keyof typeof copy.statuses],
          }))}
          copy={{
            search: copy.search,
            placeholder: copy.searchPlaceholder,
            clear: copy.clear,
            status: copy.status,
            allStatuses: copy.allStatuses,
          }}
        />
      }
    >
      <QueryBoundary query={query} inset>
        {(page) => (
          <>
            {page.data.length ? (
              <DataTable<CommercialRecord>
                embedded
                caption={copy.directoryCaption}
                rows={page.data}
                getRowKey={(record) => record.id}
                getRowHref={(record) =>
                  `/admin/commercial/${entity}/${record.id}`
                }
                columns={[
                  {
                    key: 'name',
                    header: copy.name,
                    render: (record) => (
                      <Link
                        className="font-semibold text-primary underline-offset-4 hover:underline"
                        href={`/admin/commercial/${entity}/${record.id}`}
                      >
                        {commercialName(record)}
                      </Link>
                    ),
                  },
                  {
                    key: 'status',
                    header: copy.status,
                    render: (record) => <Badge>{statusLabel(record)}</Badge>,
                  },
                  {
                    key: 'sponsor',
                    header: copy.sponsor,
                    render: (record) =>
                      'sponsor' in record
                        ? (record.sponsor?.name ?? copy.none)
                        : copy.none,
                  },
                  {
                    key: 'enabled',
                    header: copy.is_enabled,
                    render: (record) =>
                      'is_enabled' in record
                        ? record.is_enabled
                          ? copy.statuses.enabled
                          : copy.statuses.disabled
                        : copy.none,
                  },
                ]}
                renderMobileRow={(record) => (
                  <MobileRecordRow
                    title={commercialName(record)}
                    description={
                      'sponsor' in record ? record.sponsor?.name : undefined
                    }
                    footer={<Badge>{statusLabel(record)}</Badge>}
                  />
                )}
              />
            ) : (
              <div className="p-6">
                <EmptyState
                  title={copy.emptyTitle}
                  description={copy.emptyHint}
                  action={
                    <Button asChild variant="secondary">
                      <Link href={`/admin/commercial/${entity}/new`}>
                        {copy.create}
                      </Link>
                    </Button>
                  }
                />
              </div>
            )}
            <div className="border-t border-secondary px-6 py-4">
              <DirectoryPagination
                page={page.page}
                count={page.data.length}
                busy={query.isFetching}
                label={copy.pagination}
                range={copy.range}
                onNavigate={directory.setOffset}
              />
            </div>
          </>
        )}
      </QueryBoundary>
    </DataPanel>
  );
}
