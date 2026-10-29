'use client';

import {
  Badge,
  Button,
  Card,
  DirectoryFilters,
  EmptyState,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathCommunityStrings as copy } from '@/strings';
import { CommunityReportQuerySchema } from './models/communityReportQuery';
import { useCommunityReports } from './hooks';
import { useCommunityDirectory } from './useCommunityDirectory';
import { CommunityPagination } from './components/CommunityPagination';
import '@/modules/portal/styles/portal.css';
import './styles/community.css';

export function CommunityReportsScreen() {
  const directory = useCommunityDirectory();
  const parsedStatus = CommunityReportQuerySchema.shape.status.safeParse(
    directory.status || undefined,
  );
  const status = parsedStatus.success ? parsedStatus.data : undefined;
  const query = useCommunityReports({
    query: directory.query,
    status,
    offset: directory.offset,
    limit: 9,
  });
  const { confirmNavigation } = useNavigationGuard();
  const filtered = Boolean(directory.query || status);
  function clear() {
    directory.update({
      query: undefined,
      status: undefined,
      offset: undefined,
    });
  }
  return (
    <Page className="gp-portal-page gp-community gp-community-detail">
      <PageHeader
        title={copy.myReports}
        description={copy.reportsDescription}
        eyebrow={copy.title}
        action={
          <Button asChild variant="secondary">
            <NavigationLink
              href="/community"
              beforeNavigate={confirmNavigation}
            >
              <UiIcon name="chevronLeft" className="size-4" />
              {copy.back}
            </NavigationLink>
          </Button>
        }
      />
      <Card className="p-4 sm:p-5">
        <DirectoryFilters
          id="community-report-search"
          value={{ query: directory.query, status }}
          onChange={(value) =>
            directory.update({
              query: value.query || undefined,
              status: value.status,
              offset: undefined,
            })
          }
          statuses={Object.entries(copy.statuses).map(([value, label]) => ({
            value,
            label,
          }))}
          copy={{
            search: copy.reportSearch,
            placeholder: copy.reportSearchPlaceholder,
            clear: copy.clear,
            status: copy.reportStatus,
            allStatuses: copy.allReportStatuses,
          }}
        />
      </Card>
      <QueryBoundary query={query}>
        {(result) => (
          <>
            {result.data.length ? (
              <div className="grid gap-5">
                {result.data.map((report) => (
                  <Card key={report.id} className="gp-community-report">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="grid min-w-0 gap-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            intent={
                              report.status === 'open'
                                ? 'warning'
                                : report.status === 'resolved'
                                  ? 'success'
                                  : 'neutral'
                            }
                          >
                            {copy.statuses[report.status]}
                          </Badge>
                          <Badge>{copy.targets[report.targetType]}</Badge>
                        </div>
                        <h2 className="gp-community-report__title">
                          {report.snapshot.title ?? copy.commentSnapshotTitle}
                        </h2>
                      </div>
                      <time
                        dateTime={report.createdAt}
                        className="text-xs text-tertiary"
                      >
                        {new Date(report.createdAt).toLocaleString('en-US')}
                      </time>
                    </div>
                    <div className="grid gap-2">
                      <h3 className="m-0 text-sm font-semibold text-primary">
                        {copy.reportReason}
                      </h3>
                      <p className="gp-community-body">{report.reason}</p>
                    </div>
                    <details className="gp-community-snapshot">
                      <summary>{copy.originalContent}</summary>
                      <p className="gp-community-body mt-3">
                        {report.snapshot.body}
                      </p>
                    </details>
                    {report.resolutionNote ? (
                      <div className="gp-community-review">
                        <h3 className="m-0 text-sm font-semibold text-primary">
                          {copy.reviewNote}
                        </h3>
                        <p className="gp-community-body">
                          {report.resolutionNote}
                        </p>
                        {report.reviewedAt && (
                          <time
                            dateTime={report.reviewedAt}
                            className="text-xs text-tertiary"
                          >
                            {new Date(report.reviewedAt).toLocaleString(
                              'en-US',
                            )}
                          </time>
                        )}
                      </div>
                    ) : (
                      <p className="m-0 text-sm text-secondary">
                        {copy.waitingDescription}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title={
                  filtered ? copy.noReportResultsTitle : copy.noReportsTitle
                }
                description={
                  filtered ? copy.noReportResultsHint : copy.noReportsHint
                }
                action={
                  filtered ? (
                    <Button variant="secondary" onClick={clear}>
                      {copy.clearFilters}
                    </Button>
                  ) : undefined
                }
              />
            )}
            <CommunityPagination
              page={result.page}
              count={result.data.length}
              busy={query.isFetching}
              onNavigate={directory.setOffset}
            />
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
