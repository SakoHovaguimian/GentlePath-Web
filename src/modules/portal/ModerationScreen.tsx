'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DirectoryFilters,
  EmptyState,
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
import {
  CollectionPagination,
  collectionOffset,
} from './components/CollectionPagination';

export function ModerationScreen() {
  const query = useModerationReports();
  const directory = usePortalDirectory();
  const [selected, setSelected] = useState<ModerationReport | null>(null);
  const statuses = ModerationReportSchema.shape.status.options.map(
    (status) => ({ value: status, label: copy.moderation[status] }),
  );
  return (
    <div className="grid gap-7">
      <PageHeader
        title={copy.moderation.title}
        description={copy.moderation.description}
        eyebrow={copy.navigation.admin}
      />
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
        copy={{
          search: copy.common.search,
          placeholder: copy.moderation.searchPlaceholder,
          clear: copy.common.clear,
          status: copy.common.status,
          allStatuses: copy.common.allStatuses,
        }}
      />
      <QueryBoundary query={query}>
        {(reports) => {
          const filtered = reports.filter(
            (report) =>
              (!directory.status || report.status === directory.status) &&
              `${report.contentTitle} ${report.reason}`
                .toLocaleLowerCase()
                .includes(directory.query.toLocaleLowerCase()),
          );
          const offset = collectionOffset(directory.offset, filtered.length);
          return filtered.length ? (
            <>
              <div className="grid gap-4">
                {filtered.slice(offset, offset + 9).map((report) => (
                  <Card key={report.id} className="grid gap-4 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="grid gap-2">
                        <Badge
                          className="justify-self-start"
                          intent={
                            report.status === 'open' ? 'warning' : 'neutral'
                          }
                        >
                          {
                            statuses.find(
                              (status) => status.value === report.status,
                            )?.label
                          }
                        </Badge>
                        <h2 className="m-0 font-display text-xl">
                          {report.contentTitle}
                        </h2>
                      </div>
                      <span className="text-xs text-tertiary">
                        {new Date(report.createdAt).toLocaleDateString('en-US')}
                      </span>
                    </div>
                    <p className="m-0 text-sm text-secondary">
                      {report.reason}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-3">
                      <span className="text-xs text-tertiary">
                        {copy.moderation.reportedBy(report.reporterName)}
                      </span>
                      {report.status === 'open' ? (
                        <Button
                          variant="secondary"
                          onClick={() => setSelected(report)}
                        >
                          {copy.moderation.review}
                        </Button>
                      ) : (
                        <p className="m-0 text-sm text-secondary">
                          {report.resolutionNote}
                        </p>
                      )}
                    </div>
                  </Card>
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
      {selected && (
        <ReportReview
          key={selected.id}
          report={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
