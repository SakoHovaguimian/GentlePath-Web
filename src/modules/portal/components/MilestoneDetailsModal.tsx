import { useId, useState } from 'react';
import {
  Badge,
  Button,
  Modal,
  QueryBoundary,
  SegmentedTabs,
} from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { useMilestoneObservations } from '@/modules/milestone-admin/hooks';
import type { MilestoneGuidance } from '@/modules/milestone-admin/models/milestoneGuidance';
import type { MilestoneObservation } from '@/modules/milestone-admin/models/milestoneObservation';
import { MilestoneObservationEditor } from '@/modules/milestone-admin/components/MilestoneObservationEditor';
import { MilestoneObservationTimeline } from '@/modules/milestone-admin/components/MilestoneObservationTimeline';
import { formatMilestoneDate } from '@/modules/milestone-admin/formatMilestoneDate';
import { MilestoneProgressSelect } from './MilestoneProgressSelect';
import { MilestoneTips } from './MilestoneTips';
import type { MilestoneDetailsSection } from '../models/milestoneDetailsSection';
const informationSection = 'information';
const historySection = 'history';
const tipsSection = 'tips';

export function MilestoneDetailsModal({
  milestone,
  childId,
  initialSection,
  onClose,
}: {
  milestone: MilestoneGuidance;
  childId: string;
  initialSection: MilestoneDetailsSection;
  onClose: () => void;
}) {
  const [section, setSection] = useState(initialSection);
  const [editor, setEditor] = useState<MilestoneObservation | 'new' | null>(
    null,
  );
  const id = useId();
  const [historyRevision, setHistoryRevision] = useState(0);
  const query = useMilestoneObservations({
    child_id: childId,
    milestone_id: milestone.id,
    limit: 1,
    offset: 0,
  });
  return (
    <>
      <Modal
        open
        title={milestone.milestone}
        onDismiss={onClose}
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              {copy.close}
            </Button>
          </div>
        }
      >
        <div className="grid min-w-0 gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1">
              {milestone.tags.map((tag) => (
                <Badge key={tag} intent="brand">
                  {tag}
                </Badge>
              ))}
            </div>
            <SavedContentButton
              contentType="MILESTONE"
              contentId={milestone.id}
              variant="ghost"
            />
          </div>
          <SegmentedTabs
            label={copy.detailsNavigation}
            value={section}
            onValueChange={setSection}
            tabs={[
              {
                value: informationSection,
                label: copy.informationLabel,
                panelId: `${id}-information`,
              },
              {
                value: historySection,
                label: copy.historyShortAction,
                panelId: `${id}-history`,
              },
              {
                value: tipsSection,
                label: copy.tipsTitle,
                panelId: `${id}-tips`,
              },
            ]}
          />
          <div id={`${id}-${section}`} className="grid min-w-0 gap-5">
            {section === 'information' && (
              <>
                <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
                  {milestone.information}
                </p>
                {milestone.observation_guidance && (
                  <section className="grid gap-2">
                    <h3 className="m-0 text-sm font-semibold text-primary">
                      {copy.observationGuidanceLabel}
                    </h3>
                    <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
                      {milestone.observation_guidance}
                    </p>
                  </section>
                )}
                <QueryBoundary
                  query={query}
                  loadingMessage={copy.observationLoad}
                >
                  {(page) => (
                    <div className="grid gap-4 border-t border-secondary pt-5">
                      <MilestoneProgressSelect
                        milestone={milestone}
                        childId={childId}
                        latest={page.data[0]}
                      />
                      {page.data[0] && (
                        <>
                          <time
                            className="text-xs text-tertiary"
                            dateTime={page.data[0].observed_at}
                          >
                            {formatMilestoneDate(page.data[0].observed_at)}
                          </time>
                          {page.data[0].notes && (
                            <div className="grid gap-2">
                              <h3 className="m-0 text-sm font-semibold text-primary">
                                {copy.observationNotesLabel}
                              </h3>
                              <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
                                {page.data[0].notes}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {page.data[0] && (
                          <Button
                            variant="secondary"
                            onClick={() => setEditor(page.data[0])}
                          >
                            {copy.observationEditTitle}
                          </Button>
                        )}
                        <Button
                          disabled={
                            !milestone.response_options?.some(
                              (option) => !option.deleted,
                            )
                          }
                          onClick={() => setEditor('new')}
                        >
                          {copy.observationTitle}
                        </Button>
                      </div>
                    </div>
                  )}
                </QueryBoundary>
              </>
            )}
            {section === 'history' && (
              <MilestoneObservationTimeline
                key={historyRevision}
                childId={childId}
                milestone={milestone}
                onEdit={setEditor}
              />
            )}
            {section === 'tips' && <MilestoneTips milestoneId={milestone.id} />}
          </div>
        </div>
      </Modal>
      {editor && (
        <MilestoneObservationEditor
          childId={childId}
          milestone={milestone}
          observation={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(null)}
          onDeleted={() => setHistoryRevision((value) => value + 1)}
        />
      )}
    </>
  );
}
