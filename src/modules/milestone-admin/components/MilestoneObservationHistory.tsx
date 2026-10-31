import { useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { MilestoneGuidance } from '../models/milestoneGuidance';
import type { MilestoneObservation } from '../models/milestoneObservation';
import { MilestoneObservationEditor } from './MilestoneObservationEditor';
import { MilestoneObservationTimeline } from './MilestoneObservationTimeline';

export function MilestoneObservationHistory({
  childId,
  milestone,
  onClose,
}: {
  childId: string;
  milestone: MilestoneGuidance;
  onClose: () => void;
}) {
  const [editor, setEditor] = useState<MilestoneObservation | null>(null);
  if (editor)
    return (
      <MilestoneObservationEditor
        childId={childId}
        milestone={milestone}
        observation={editor}
        onClose={() => setEditor(null)}
      />
    );
  return (
    <Modal
      open
      title={copy.observationHistory}
      description={copy.observationHistoryDescription}
      onDismiss={onClose}

      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            {copy.close}
          </Button>
        </div>
      }
    >
      <div className="grid gap-5">
        <p className="m-0 font-display text-xl text-primary wrap-anywhere">
          {milestone.milestone}
        </p>
        <MilestoneObservationTimeline
          childId={childId}
          milestone={milestone}
          onEdit={setEditor}
        />
      </div>
    </Modal>
  );
}
