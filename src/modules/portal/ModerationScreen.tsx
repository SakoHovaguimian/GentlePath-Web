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
  UiIcon,
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
import styles from './Admin.module.css';

export function ModerationScreen() {
  const query = useModerationReports();
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
          icon={
            <span className={styles.roundIcon} data-tone="lilac">
              <UiIcon name="lock" />
            </span>
          }
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
              <div className={styles.reports}>
                {filtered.slice(offset, offset + 9).map((report) => (
                  <Card
                    key={report.id}
                    className={styles.report}
                    data-status={report.status}
                  >
                    <div className={styles.reportHeader}>
                      <div className={styles.reportIdentity}>
                        <span
                          className={styles.roundIcon}
                          data-tone={
                            report.status === 'open'
                              ? 'sunlight'
                              : report.status === 'dismissed'
                                ? 'lilac'
                                : 'sage'
                          }
                        >
                          <UiIcon
                            name={
                              report.status === 'open'
                                ? 'warning'
                                : report.status === 'dismissed'
                                  ? 'close'
                                  : 'check'
                            }
                          />
                        </span>
                        <div>
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
                          <h2>{report.contentTitle}</h2>
                        </div>
                      </div>
                      <time
                        dateTime={report.createdAt}
                        className="text-xs text-tertiary"
                      >
                        {new Date(report.createdAt).toLocaleDateString('en-US')}
                      </time>
                    </div>
                    <p className={styles.reportReason}>{report.reason}</p>
                    <div className={styles.reportFooter}>
                      <span className="text-xs text-tertiary">
                        {copy.moderation.reportedBy(report.reporterName)}
                      </span>
                      {report.status === 'open' ? (
                        <Button
                          variant="secondary"
                          onClick={() => setSelected(report)}
                        >
                          {copy.moderation.review}
                          <UiIcon name="arrowRight" className="size-4" />
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
