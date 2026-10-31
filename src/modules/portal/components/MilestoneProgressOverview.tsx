import { useId } from 'react';
import { InlineLoading, QueryBoundary } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { useMilestoneProgressSummary } from '@/modules/milestone-admin/hooks';
import { MilestoneProgressStateSchema } from '@/modules/milestone-admin/models/milestoneProgressState';

export function MilestoneProgressOverview({ childId }: { childId: string }) {
  const query = useMilestoneProgressSummary(childId);
  const id = useId();
  const answeredStates = MilestoneProgressStateSchema.options.filter(
    (state) => state !== 'unrecorded',
  );
  return (
    <section
      className="gp-milestone-progress"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      aria-busy={query.isFetching}
    >
      <header className="gp-milestone-progress__heading">
        <h2 id={`${id}-title`}>{copy.overview.title}</h2>
        <p id={`${id}-description`}>{copy.overview.description}</p>
      </header>
      <QueryBoundary
        query={query}
        animateChanges
        loadingMessage={copy.overview.loading}
        loadingFallback={<InlineLoading message={copy.overview.loading} />}
      >
        {(summary) => (
          <>
            <div className="gp-milestone-progress__summary">
              <p className="gp-milestone-progress__total">
                {copy.overview.total(summary.total)}
              </p>
              <dl className="gp-milestone-progress__counts">
                <div>
                  <dt>{copy.overview.unanswered}</dt>
                  <dd>{summary.unanswered}</dd>
                </div>
                <div>
                  <dt>{copy.overview.answered}</dt>
                  <dd>{summary.answered}</dd>
                </div>
              </dl>
            </div>
            <div className="gp-milestone-progress__track" aria-hidden="true">
              {answeredStates.map((state) => (
                <span
                  key={state}
                  className="gp-milestone-progress__segment"
                  data-state={state}
                  style={{
                    width: `${summary.total ? (summary.counts[state] / summary.total) * 100 : 0}%`,
                  }}
                />
              ))}
            </div>
            <ul
              className="gp-milestone-progress__legend"
              aria-label={copy.overview.legend}
            >
              {[...answeredStates, 'unrecorded' as const].map((state) => (
                <li
                  key={state}
                  aria-label={copy.overview.categoryCount(
                    state === 'unrecorded'
                      ? copy.overview.unanswered
                      : copy.progressStates[state],
                    summary.counts[state],
                  )}
                >
                  <span
                    className="gp-milestone-progress__swatch"
                    data-state={state}
                    aria-hidden="true"
                  />
                  <span>
                    {state === 'unrecorded'
                      ? copy.overview.unanswered
                      : copy.progressStates[state]}
                  </span>
                  <strong>{summary.counts[state]}</strong>
                </li>
              ))}
            </ul>
            <p role="status" aria-atomic="true" className="sr-only">
              {copy.overview.status(
                summary.answered,
                summary.unanswered,
                summary.total,
              )}
            </p>
            {summary.total === 0 && (
              <p className="gp-milestone-progress__empty">
                {copy.overview.emptyHint}
              </p>
            )}
          </>
        )}
      </QueryBoundary>
    </section>
  );
}
