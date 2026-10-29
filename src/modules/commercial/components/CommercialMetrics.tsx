'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DataPanel,
  DataTable,
  DirectoryPagination,
  EmptyState,
  Field,
  Input,
  Message,
  PageSection,
  QueryBoundary,
  Button,
} from '@/components/ui';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { useCommercialMetrics } from '../hooks';
import type { CommercialFilters } from '../models/commercialDirectory';
const keys = [
  'metric_from',
  'metric_to',
  'placement_item_id',
  'placement_id',
  'creative_id',
  'campaign_id',
  'sponsor_id',
] as const;
export function CommercialMetrics() {
  const params = useSearchParams();
  const directory = usePortalDirectory();
  const initial = Object.fromEntries(
    keys.map((key) => [key, params.get(key) ?? '']),
  );
  const filters: CommercialFilters = { offset: directory.offset };
  keys.forEach((key) => {
    if (params.get(key)) filters[key] = params.get(key)!;
  });
  const query = useCommercialMetrics(filters);
  return (
    <PageSection
      id="commercial-metrics"
      title={copy.metrics}
      description={copy.metricsHint}
    >
      <Message
        title={copy.metrics}
        description={copy.metricFilterHint}
        intent="neutral"
      />
      <DataPanel
        busy={query.isFetching}
        busyLabel={copy.loadingTitle}
        toolbar={
          <MetricFilters
            key={JSON.stringify(initial)}
            initial={initial}
            onApply={(draft) =>
              directory.update({ ...draft, offset: undefined })
            }
          />
        }
      >
        <QueryBoundary query={query} inset>
          {(page) => (
            <>
              {page.data.length ? (
                <DataTable
                  embedded
                  caption={copy.metrics}
                  rows={page.data}
                  getRowKey={(row) => row.id}
                  columns={[
                    {
                      key: 'date',
                      header: copy.metric_date,
                      render: (row) => row.metric_date,
                    },
                    {
                      key: 'item',
                      header: copy.placement_item_id,
                      render: (row) => (
                        <span className="font-mono text-xs">
                          {row.placement_item_id}
                        </span>
                      ),
                    },
                    {
                      key: 'impressions',
                      header: copy.impressions,
                      render: (row) => row.impressions.toLocaleString('en-US'),
                    },
                    {
                      key: 'clicks',
                      header: copy.clicks,
                      render: (row) => row.clicks.toLocaleString('en-US'),
                    },
                    {
                      key: 'copies',
                      header: copy.code_copies,
                      render: (row) => row.code_copies.toLocaleString('en-US'),
                    },
                  ]}
                />
              ) : (
                <div className="p-6">
                  <EmptyState
                    title={copy.emptyTitle}
                    description={copy.emptyHint}
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
    </PageSection>
  );
}

interface MetricFiltersProps {
  initial: Record<string, string>;
  onApply: (values: Record<string, string>) => void;
}
function MetricFilters({ initial, onApply }: MetricFiltersProps) {
  const [draft, setDraft] = useState(initial);
  return (
    <form
      noValidate
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft);
      }}
    >
      {keys.map((key) => (
        <Field key={key} labelText={copy[key]}>
          <Input
            type={
              key === 'metric_from' || key === 'metric_to' ? 'date' : 'text'
            }
            value={draft[key]}
            onChange={(event) =>
              setDraft((current) => ({ ...current, [key]: event.target.value }))
            }
            maxLength={64}
          />
        </Field>
      ))}
      <Button type="submit" variant="secondary" className="self-end">
        {copy.applyFilters}
      </Button>
    </form>
  );
}
