'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Modal,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import type { MilestoneGuidance } from '@/modules/milestone-admin/models/milestoneGuidance';
import { useMilestoneObservations } from '@/modules/milestone-admin/hooks';
import { MilestoneObservationEditor } from '@/modules/milestone-admin/components/MilestoneObservationEditor';
import { MilestoneObservationHistory } from '@/modules/milestone-admin/components/MilestoneObservationHistory';
import { formatMilestoneDate } from '@/modules/milestone-admin/formatMilestoneDate';
interface MilestoneCardProps {
  milestone: MilestoneGuidance;
  childId: string;
}
export function MilestoneCard({ milestone, childId }: MilestoneCardProps) {
  const [editor, setEditor] = useState(false);
  const [history, setHistory] = useState(false);
  const [reader, setReader] = useState(false);
  const query = useMilestoneObservations({
    child_id: childId,
    milestone_id: milestone.id,
    limit: 1,
    offset: 0,
  });
  const activeOptions = (milestone.response_options ?? []).filter(
    (option) => !option.deleted,
  );
  return (
    <>
      <Card className="gp-milestone-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-1">
            {milestone.tags.map((tag) => (
              <Badge key={tag} intent="brand">
                {tag}
              </Badge>
            ))}
          </div>
          <span className="gp-milestone-card__icon" aria-hidden="true">
            <UiIcon name="leaf" />
          </span>
        </div>
        <h2 className="wrap-anywhere">{milestone.milestone}</h2>
        <p className="m-0 line-clamp-5 flex-1 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
          {milestone.information}
        </p>
        <Button
          variant="ghost"
          className="self-start"
          onClick={() => setReader(true)}
        >
          {copy.readGuidance}
        </Button>
        <QueryBoundary query={query} loadingMessage={copy.observationLoad}>
          {(page) => (
            <div className="grid gap-1 rounded-xl bg-secondary_subtle p-3">
              <span className="text-xs font-medium text-secondary">
                {copy.latestResponse}
              </span>
              <p className="m-0 text-xs text-tertiary wrap-anywhere">
                {page.data[0]
                  ? copy.latestObservation(
                      page.data[0].response_option?.label ?? copy.responseLabel,
                      formatMilestoneDate(page.data[0].observed_at),
                    )
                  : copy.noObservationsDescription}
              </p>
            </div>
          )}
        </QueryBoundary>
        {!activeOptions.length && (
          <p className="m-0 text-xs text-tertiary">
            {copy.noResponsesDescription}
          </p>
        )}
        <Button
          variant="primary"
          disabled={!activeOptions.length}
          onClick={() => setEditor(true)}
        >
          <UiIcon name="plus" />
          {copy.observationTitle}
        </Button>
        <Button variant="secondary" onClick={() => setHistory(true)}>
          <UiIcon name="clock" />
          {copy.observationHistory}
        </Button>
        <div className="flex flex-wrap items-center gap-2 border-t border-secondary pt-4">
          <Button variant="ghost" asChild>
            <Link
              href={`/tips?milestone_id=${encodeURIComponent(milestone.id)}`}
            >
              {copy.browseMilestoneTips}
            </Link>
          </Button>
          <SavedContentButton
            contentType="MILESTONE"
            contentId={milestone.id}
          />
        </div>
      </Card>
      {reader && (
        <Modal
          open
          title={milestone.milestone}
          description={copy.guidanceTitle}
          onDismiss={() => setReader(false)}
        >
          <div className="grid gap-5">
            <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
              {milestone.information}
            </p>
            {milestone.observation_guidance && (
              <div className="grid gap-2">
                <h3 className="m-0 text-sm font-semibold text-primary">
                  {copy.observationGuidanceLabel}
                </h3>
                <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
                  {milestone.observation_guidance}
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setReader(false)}>
                {copy.close}
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {editor && (
        <MilestoneObservationEditor
          childId={childId}
          milestone={milestone}
          onClose={() => setEditor(false)}
        />
      )}
      {history && (
        <MilestoneObservationHistory
          childId={childId}
          milestone={milestone}
          onClose={() => setHistory(false)}
        />
      )}
    </>
  );
}
