'use client';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  NavigationLink,
  Page,
  PageHeader,
  QueryBoundary,
  SegmentedTabs,
} from '@/components/ui';
import { useId } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { gentlePathCommunityDiscoveryStrings as copy } from '@/strings';
import { useCommunityProfile, useCommunityProfileActivity } from './hooks';
import type { CommunityProfileActivityKind } from './models/communityProfileActivityKind';
import { CommunityPagination } from './components/CommunityPagination';

function ActivitySection({
  id,
  kind,
}: {
  id: string;
  kind: CommunityProfileActivityKind;
}) {
  const directory = usePortalDirectory();
  const key = `${kind}_offset`;
  const params = useSearchParams();
  const rawOffset = Number(params.get(key) ?? 0);
  const offset =
    Number.isSafeInteger(rawOffset) && rawOffset > 0 ? rawOffset : 0;
  const query = useCommunityProfileActivity(id, kind, offset);
  return (
    <QueryBoundary query={query}>
      {(result) => (
        <div className="grid gap-4">
          {result.data.length ? (
            result.data.map((item) => (
              <Card key={item.id} className="grid gap-3">
                <h3 className="m-0 font-display text-xl font-normal">
                  <NavigationLink href={item.href} className="hover:underline">
                    {item.title}
                  </NavigationLink>
                </h3>
                <p className="m-0 line-clamp-4 whitespace-pre-wrap text-sm text-secondary">
                  {item.body}
                </p>
                <time
                  dateTime={item.createdAt}
                  className="text-xs text-tertiary"
                >
                  {new Date(item.createdAt).toLocaleDateString('en-US')}
                </time>
              </Card>
            ))
          ) : (
            <EmptyState
              title={copy.emptyActivityTitle}
              description={copy.emptyActivity}
            />
          )}
          <CommunityPagination
            page={result.page}
            count={result.data.length}
            busy={query.isFetching}
            onNavigate={(value) =>
              directory.update({ [key]: value ? String(value) : undefined })
            }
          />
        </div>
      )}
    </QueryBoundary>
  );
}

export function CommunityProfileScreen({ id }: { id: string }) {
  const panelId = useId();
  const profile = useCommunityProfile(id);
  const directory = usePortalDirectory();
  const selected = ['posts', 'polls', 'tips', 'comments'].includes(
    directory.status,
  )
    ? (directory.status as keyof typeof copy.activity)
    : 'posts';
  return (
    <Page>
      <Button asChild variant="ghost" className="justify-self-start">
        <NavigationLink href="/community">{copy.back}</NavigationLink>
      </Button>
      <QueryBoundary query={profile}>
        {(parent) => (
          <>
            <PageHeader
              title={copy.profileName(parent.first_name, parent.last_name)}
              description={copy.profileHint}
            />
            <Card className="grid gap-3">
              <h2 className="m-0 font-display text-xl font-normal">
                {copy.children(parent.child_count)}
              </h2>
              <div className="flex flex-wrap gap-2">
                {parent.child_ages.map((age, index) => (
                  <Badge key={`${age}-${index}`}>{copy.age(age)}</Badge>
                ))}
              </div>
              {!parent.child_count && (
                <p className="m-0 text-sm text-secondary">{copy.noChildren}</p>
              )}
            </Card>
            <SegmentedTabs
              label={copy.profileTitle}
              value={selected}
              tabs={(
                Object.keys(copy.activity) as (keyof typeof copy.activity)[]
              ).map((kind) => ({
                value: kind,
                label: copy.activityCount(
                  copy.activity[kind],
                  parent.activity_counts[kind],
                ),
                panelId,
              }))}
              onValueChange={(kind) => directory.update({ status: kind })}
            />
            <div id={panelId} role="group" aria-label={copy.activity[selected]}>
              {selected === 'comments' ? (
                <div className="grid gap-6">
                  <section className="grid gap-4">
                    <h2 className="m-0 font-display text-xl">
                      {copy.postComments}
                    </h2>
                    <ActivitySection id={id} kind="post_comments" />
                  </section>
                  <section className="grid gap-4">
                    <h2 className="m-0 font-display text-xl">
                      {copy.pollComments}
                    </h2>
                    <ActivitySection id={id} kind="poll_comments" />
                  </section>
                </div>
              ) : (
                <ActivitySection key={selected} id={id} kind={selected} />
              )}
            </div>
          </>
        )}
      </QueryBoundary>
    </Page>
  );
}
