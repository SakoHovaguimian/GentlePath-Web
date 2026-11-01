'use client';

import { useState } from 'react';
import { Button, QueryBoundary } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { useMilestoneObservations } from '@/modules/milestone-admin/hooks';
import type { MilestoneGuidance } from '@/modules/milestone-admin/models/milestoneGuidance';
import type { MilestoneObservation } from '@/modules/milestone-admin/models/milestoneObservation';
import { MilestoneObservationEditor } from '@/modules/milestone-admin/components/MilestoneObservationEditor';
import { MilestoneObservationTimeline } from '@/modules/milestone-admin/components/MilestoneObservationTimeline';
import { MilestoneProgressSelect } from './MilestoneProgressSelect';

export function MilestonePrivateProgress({
  milestone,
  childId,
}: {
  milestone: MilestoneGuidance;
  childId: string;
}) {
  const [editor, setEditor] = useState<MilestoneObservation | 'new' | null>(
    null,
  );
  const [historyRevision, setHistoryRevision] = useState(0);
  const latest = useMilestoneObservations({
    child_id: childId,
    milestone_id: milestone.id,
    limit: 1,
    offset: 0,
  });
  return (
    <div className="grid min-w-0 gap-6">
      <QueryBoundary query={latest} loadingMessage={copy.observationLoad}>
        {(page) => (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <MilestoneProgressSelect
                milestone={milestone}
                childId={childId}
                latest={page.data[0]}
              />
            </div>
            <Button
              disabled={
                !milestone.response_options?.some((option) => !option.deleted)
              }
              onClick={() => setEditor('new')}
            >
              {copy.observationTitle}
            </Button>
          </div>
        )}
      </QueryBoundary>
      <div id="observation-history" className="grid min-w-0 gap-4">
        <h3 className="m-0 font-display text-xl font-normal text-primary">
          {copy.observationHistory}
        </h3>
        <MilestoneObservationTimeline
          key={historyRevision}
          childId={childId}
          milestone={milestone}
          onEdit={setEditor}
        />
      </div>
      {editor && (
        <MilestoneObservationEditor
          childId={childId}
          milestone={milestone}
          observation={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(null)}
          onDeleted={() => setHistoryRevision((value) => value + 1)}
        />
      )}
    </div>
  );
}
