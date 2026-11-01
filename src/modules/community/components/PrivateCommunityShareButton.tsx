'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { gentlePathCommunityDiscoveryStrings as copy } from '@/strings';
import { useCommunityStatus } from '../hooks';
import { CommunityPostEditor } from './CommunityPostEditor';

/** Accepts only context identifiers; private record content never enters the composer. */
export function PrivateCommunityShareButton({
  childId,
  milestoneId,
}: {
  childId?: string;
  milestoneId?: string;
}) {
  const [open, setOpen] = useState(false);
  const status = useCommunityStatus();
  return (
    <>
      <Button
        variant="secondary"
        title={copy.shareHint}
        disabled={!status.data?.enabled}
        onClick={() => setOpen(true)}
      >
        {copy.share}
      </Button>
      {open && (
        <CommunityPostEditor
          writable={status.data?.enabled === true}
          initialKind="WIN"
          initialChildId={childId}
          initialMilestoneIds={milestoneId ? [milestoneId] : []}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
