'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, EmptyState, QueryBoundary, UiIcon } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { useFamilyTips } from '@/modules/milestone-admin/hooks';
import { MilestonePagination } from '@/modules/milestone-admin/components/MilestonePagination';
import { formatMilestoneDate } from '@/modules/milestone-admin/formatMilestoneDate';

export function MilestoneTips({ milestoneId }: { milestoneId: string }) {
  const [offset, setOffset] = useState(0);
  const query = useFamilyTips('approved', {
    query: '',
    tag: '',
    milestone_id: milestoneId,
    limit: 9,
    offset,
  });
  return (
    <div className="grid gap-5">
      <QueryBoundary query={query} loadingMessage={copy.loadingTips}>
        {(page) =>
          page.data.length ? (
            <div className="grid gap-4">
              {page.data.map((tip) => (
                <article
                  key={tip.id}
                  className="grid gap-3 rounded-xl border border-secondary p-4"
                >
                  <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
                    {tip.message}
                  </p>
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-tertiary">
                    <span>
                      {tip.author
                        ? copy.authorName(
                            tip.author.first_name,
                            tip.author.last_name,
                          )
                        : copy.unavailableAuthor}
                    </span>
                    <time dateTime={tip.created_at}>
                      {formatMilestoneDate(tip.created_at)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="plain"
              title={copy.emptyTipsTitle}
              description={copy.emptyTipsDescription}
            />
          )
        }
      </QueryBoundary>
      {query.data && (
        <MilestonePagination
          page={query.data}
          busy={query.isFetching}
          onNavigate={setOffset}
        />
      )}
      <Button variant="secondary" asChild>
        <Link href={`/tips?milestone_id=${encodeURIComponent(milestoneId)}`}>
          {copy.browseMilestoneTips}
          <UiIcon name="arrowRight" className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
