'use client';

import { Button, Card, NavigationLink, QueryBoundary } from '@/components/ui';
import { gentlePathApplicationStrings as copy } from '@/strings';
import { usePriorityFollowUps } from '../hooks';
import { FollowUpRow } from './FollowUpRow';

export function PriorityFollowUps() {
  const query = usePriorityFollowUps(3);
  if (query.data && !query.data.data.length && !query.isError) return null;
  return (
    <QueryBoundary query={query}>
      {(result) =>
        result.data.length ? (
          <Card className="grid gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="m-0 font-display text-xl text-primary">
                  {copy.priorityTitle}
                </h2>
                <p className="mb-0 mt-2 text-sm text-secondary">
                  {copy.priorityDescription}
                </p>
              </div>
              <Button asChild variant="ghost">
                <NavigationLink href="/applications/follow-ups">
                  {copy.priorityViewAll}
                </NavigationLink>
              </Button>
            </div>
            <div>
              {result.data.map((followUp) => (
                <FollowUpRow key={followUp.id} followUp={followUp} priority />
              ))}
            </div>
          </Card>
        ) : null
      }
    </QueryBoundary>
  );
}
