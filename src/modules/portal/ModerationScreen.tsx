'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  DirectoryFilters,
  EmptyState,
  Field,
  Select,
  PageHeader,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useModerationReports } from './adminHooks';
import { usePortalDirectory } from './usePortalDirectory';
import {
  ModerationReportSchema,
  type ModerationReport,
} from './models/moderationReport';
import { ReportReview } from './components/ReportReview';
import { ReportDetails } from './components/ReportDetails';
import { ModerationReportCard } from './components/ModerationReportCard';
import { ModerationSortSchema } from './models/moderationSort';
import { sortModerationReports } from './services/sortModerationReports';
import {
  CollectionPagination,
  collectionOffset,
} from './components/CollectionPagination';
import styles from './Admin.module.css';

export function ModerationScreen() {
  const query = useModerationReports();
  const params = useSearchParams();
  const sort = ModerationSortSchema.catch('latest').parse(
    params.get('sort') ?? 'latest',
  );
  const directory = usePortalDirectory();
  const [selected, setSelected] = useState<ModerationReport | null>(null);
  const statuses = ModerationReportSchema.shape.status.options.map(
    (status) => ({ value: status, label: copy.moderation[status] }),
  );
  return (
    <div className={styles.page}>
      <div className={styles.intro} data-tone="lilac">
        <PageHeader
          title={copy.moderation.title}
          description={copy.moderation.description}
          eyebrow={copy.navigation.admin}
        />
      </div>
      <Card className="p-4 sm:p-5">
        <DirectoryFilters
          id="report-search"
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
          statuses={statuses}
          additionalFilters={
            <Field labelText={copy.moderation.sortLabel}>
              <Select
                className="@4xl:w-48"
                value={sort}
                onValueChange={(value) =>
                  directory.update({
                    sort: value === 'latest' ? undefined : value,
                    offset: undefined,
                  })
                }
              >
                {ModerationSortSchema.options.map((value) => (
                  <option key={value} value={value}>
                    {copy.moderation.sortOptions[value]}
                  </option>
                ))}
              </Select>
            </Field>
          }
          copy={{
            search: copy.common.search,
            placeholder: copy.moderation.searchPlaceholder,
            clear: copy.common.clear,
            status: copy.common.status,
            allStatuses: copy.common.allStatuses,
          }}
        />
      </Card>
      <QueryBoundary query={query}>
        {(reports) => {
          const filtered = sortModerationReports(
            reports.filter(
              (report) =>
                (!directory.status || report.status === directory.status) &&
                `${report.contentTitle} ${report.reason}`
                  .toLocaleLowerCase()
                  .includes(directory.query.toLocaleLowerCase()),
            ),
            sort,
          );
          const offset = collectionOffset(directory.offset, filtered.length);
          return filtered.length ? (
            <>
              <div className={styles.reports}>
                {filtered.slice(offset, offset + 9).map((report) => (
                  <ModerationReportCard
                    key={report.id}
                    report={report}
                    onOpen={() => setSelected(report)}
                  />
                ))}
              </div>
              <CollectionPagination
                total={filtered.length}
                offset={offset}
                onNavigate={directory.setOffset}
              />
            </>
          ) : (
            <EmptyState
              title={
                directory.query || directory.status
                  ? copy.common.noResultsTitle
                  : copy.moderation.emptyTitle
              }
              description={
                directory.query || directory.status
                  ? copy.common.noResultsHint
                  : copy.moderation.emptyHint
              }
              action={
                directory.query || directory.status ? (
                  <Button
                    variant="secondary"
                    onClick={() =>
                      directory.update({
                        query: undefined,
                        status: undefined,
                        offset: undefined,
                      })
                    }
                  >
                    {copy.common.clear}
                  </Button>
                ) : undefined
              }
            />
          );
        }}
      </QueryBoundary>
      {selected &&
        (selected.status === 'open' ? (
          <ReportReview
            key={selected.id}
            report={selected}
            onClose={() => setSelected(null)}
          />
        ) : (
          <ReportDetails report={selected} onClose={() => setSelected(null)} />
        ))}
    </div>
  );
}
