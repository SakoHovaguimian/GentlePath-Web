'use client';

import { useSearchParams } from 'next/navigation';
import { Button, QueryBoundary } from '@/components/ui';
import { gentlePathEditorialDiscoveryStrings as copy } from '@/strings';
import type { MilestoneGuidance } from '@/modules/milestone-admin/models/milestoneGuidance';
import { useChildren } from '../hooks';
import { usePortalDirectory } from '../usePortalDirectory';
import { ChildProfilePicker } from './ChildProfilePicker';
import { MilestonePrivateProgress } from './MilestonePrivateProgress';
import { milestoneListReturnPath } from '../milestoneReaderPath';

export function MilestoneFamilyContext({
  milestone,
}: {
  milestone: MilestoneGuidance;
}) {
  const children = useChildren();
  const params = useSearchParams();
  const directory = usePortalDirectory();
  return (
    <QueryBoundary query={children}>
      {(profiles) => {
        const requested = params.get('child') ?? '';
        const childId = profiles.find((child) => child.id === requested)?.id;
        const select = (child: string) => {
          const destination = new URL(
            milestoneListReturnPath(params.get('returnTo')),
            'https://gentlepath.internal',
          );
          if (child) destination.searchParams.set('child', child);
          else {
            destination.searchParams.delete('child');
            destination.searchParams.delete('progress');
          }
          directory.update({
            child: child || undefined,
            returnTo: `${destination.pathname}${destination.search}`,
          });
        };
        return (
          <div className="grid min-w-0 gap-5">
            <p className="m-0 text-sm text-secondary">{copy.noChildHint}</p>
            <div className="flex flex-wrap items-end gap-3">
              <Button
                variant="secondary"
                aria-pressed={!childId}
                onClick={() => select('')}
              >
                {copy.browseGuidance}
              </Button>
              {profiles.length > 0 && (
                <ChildProfilePicker
                  profiles={profiles}
                  value={childId ?? ''}
                  onValueChange={select}
                />
              )}
            </div>
            {requested && !childId && (
              <p role="status" className="m-0 text-sm text-secondary">
                {copy.childUnavailableDescription}
              </p>
            )}
            {childId && (
              <MilestonePrivateProgress
                key={childId}
                milestone={milestone}
                childId={childId}
              />
            )}
          </div>
        );
      }}
    </QueryBoundary>
  );
}
