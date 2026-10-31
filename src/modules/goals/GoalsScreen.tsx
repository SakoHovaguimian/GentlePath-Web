'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  buttonClassName,
  Badge,
  Button,
  Card,
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
import { gentlePathGoalStrings as copy } from '@/strings';
import { useChildren } from '@/modules/portal/hooks';
import { usePortalDirectory } from '@/modules/portal/usePortalDirectory';
import { useGoals } from './hooks';
import { GoalStatusSchema } from './models/goalStatus';
import { goalStatusLabel } from './services/goalStatusLabel';
import { GoalMediaPreview } from './components/GoalMediaPreview';
import '@/modules/portal/styles/portal.css';

const allItems = '';

export function GoalsScreen() {
  const children = useChildren();
  const directory = usePortalDirectory();
  const params = useSearchParams();
  const childId = params.get('child') ?? '';
  const status = GoalStatusSchema.safeParse(directory.status);
  const [query, setQuery] = useState('');
  const goals = useGoals({
    query,
    child_id: childId || undefined,
    status: status.success ? status.data : undefined,
    limit: 12,
    offset: directory.offset,
  });
  useEffect(() => {
    if (
      goals.isSuccess &&
      !goals.isFetching &&
      !goals.data.data.length &&
      directory.offset > 0
    ) {
      directory.setOffset(Math.max(0, directory.offset - 12));
    }
  }, [goals.isSuccess, goals.isFetching, goals.data, directory]);
  return (
    <Page className="gp-portal-page">
      <PageHeader
        title={copy.title}
        description={copy.description}
        action={
          children.data?.length ? (
            <NavigationLink className={buttonClassName()} href="/goals/new">
              {copy.newGoal}
            </NavigationLink>
          ) : undefined
        }
      />
      <DirectoryFilters
        id="goal-search"
        value={{ query, status: status.success ? status.data : undefined }}
        onChange={(value) => {
          setQuery(value.query);
          directory.update({ status: value.status, offset: undefined });
        }}
        statuses={GoalStatusSchema.options.map((value) => ({
          value,
          label: goalStatusLabel(value),
        }))}
        copy={{
          search: copy.search,
          placeholder: copy.searchPlaceholder,
          clear: copy.clearSearch,
          status: copy.status,
          allStatuses: copy.allStatuses,
        }}
        additionalFilters={
          <Field labelText={copy.child}>
            <Select
              value={childId}
              onValueChange={(value) =>
                directory.update({
                  child: value || undefined,
                  offset: undefined,
                })
              }
            >
              <option value={allItems}>{copy.allChildren}</option>
              {children.data?.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </Select>
          </Field>
        }
      />
      <QueryBoundary query={children}>
        {(profiles) =>
          profiles.length === 0 ? (
            <EmptyState
              title={copy.noChildrenTitle}
              description={copy.noChildrenDescription}
              action={
                <NavigationLink href="/family" className={buttonClassName()}>
                  {copy.manageChildren}
                </NavigationLink>
              }
            />
          ) : (
            <QueryBoundary query={goals}>
              {(result) => (
                <>
                  {result.data.length === 0 ? (
                    <EmptyState
                      title={
                        query || childId || status.success
                          ? copy.noMatches
                          : copy.emptyTitle
                      }
                      description={copy.emptyDescription}
                      action={
                        <NavigationLink
                          href="/goals/new"
                          className={buttonClassName()}
                        >
                          {copy.newGoal}
                        </NavigationLink>
                      }
                    />
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {result.data.map((goal) => {
                        const cover = goal.media.find(
                          (media) => media.id === goal.cover_media_id,
                        );
                        return (
                          <Card
                            key={goal.id}
                            className="relative flex flex-col overflow-hidden p-0 sm:p-0"
                          >
                            {cover && (
                              <GoalMediaPreview
                                goalId={goal.id}
                                media={cover}
                                compact
                              />
                            )}
                            <div className="grid flex-1 gap-3 p-5">
                              <div className="flex flex-wrap gap-2">
                                <Badge intent="brand">
                                  {goalStatusLabel(goal.status)}
                                </Badge>
                                <Badge intent="neutral">
                                  {profiles.find(
                                    (child) => child.id === goal.child_id,
                                  )?.name ?? copy.child}
                                </Badge>
                              </div>
                              <h2 className="m-0 font-display text-2xl">
                                <NavigationLink
                                  href={`/goals/${goal.id}`}
                                  className="ui-card-open"
                                >
                                  {goal.title}
                                </NavigationLink>
                              </h2>
                              {goal.description && (
                                <p className="line-clamp-3 m-0 text-sm text-secondary">
                                  {goal.description}
                                </p>
                              )}
                              <div className="mt-auto flex flex-wrap gap-3 pt-3 text-xs text-tertiary">
                                <span>
                                  {copy.attachmentCount(goal.media.length)}
                                </span>
                                <span>{copy.noteCount(goal.notes.length)}</span>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                  <DirectoryPagination
                    page={result.page}
                    count={result.data.length}
                    busy={goals.isFetching}
                    label={copy.title}
                    range={(from, to) => `${from}–${to}`}
                    onNavigate={directory.setOffset}
                  />
                </>
              )}
            </QueryBoundary>
          )
        }
      </QueryBoundary>
      {goals.isError && goals.data && (
        <Button variant="secondary" onClick={() => void goals.refetch()}>
          {copy.retry}
        </Button>
      )}
    </Page>
  );
}
