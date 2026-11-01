'use client';

import { Badge, NavigationLink } from '@/components/ui';
import { gentlePathLinkedContentStrings as copy } from '@/strings';
import { useMilestoneChoices } from '../hooks';

export function MilestoneLinkList({ ids }: { ids: string[] }) {
  const query = useMilestoneChoices();
  if (!ids.length) return null;
  return (
    <div className="relative z-10 flex flex-wrap gap-2" aria-label={copy.label}>
      {ids.map((id) => {
        const milestone = query.data?.find((item) => item.id === id);
        return milestone ? (
          <NavigationLink
            key={id}
            href={`/milestones/${encodeURIComponent(id)}`}
            className="hover:underline"
          >
            <Badge>{milestone.milestone}</Badge>
          </NavigationLink>
        ) : null;
      })}
    </div>
  );
}
