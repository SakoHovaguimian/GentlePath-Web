'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  IconButton,
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
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap gap-1">
            {milestone.tags.map((tag) => (
              <Badge key={tag} intent="brand">
                {tag}
              </Badge>
            ))}
          </div>
          <IconButton
            label={copy.readGuidance}
            variant="ghost"
            onClick={() => setReader(true)}
          >
            <UiIcon name="info" className="size-5" />
          </IconButton>
        </div>
        <div className="grid gap-2">
          <h2 className="wrap-anywhere">{milestone.milestone}</h2>
          <p className="m-0 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-secondary wrap-anywhere">
            {milestone.information}
          </p>
        </div>
        <QueryBoundary query={query} loadingMessage={copy.observationLoad}>
          {(page) => (
            <div className="gp-milestone-card__latest">
              <UiIcon
                name={page.data[0] ? 'check' : 'leaf'}
                className="size-5 shrink-0 text-brand-secondary"
              />
              <div className="grid min-w-0 gap-1">
                <span className="text-xs text-tertiary">
                  {page.data[0]
                    ? copy.latestResponse
                    : copy.noObservationsTitle}
                </span>
                {page.data[0] ? (
                  <>
                    <p className="m-0 text-sm font-semibold text-primary wrap-anywhere">
                      {page.data[0].response_option?.label ??
                        copy.responseLabel}
                    </p>
                    <time
                      dateTime={page.data[0].observed_at}
                      className="text-xs text-tertiary"
                    >
                      {formatMilestoneDate(page.data[0].observed_at)}
                    </time>
                  </>
                ) : (
                  <p className="m-0 text-sm text-secondary">
                    {copy.firstObservationHint}
                  </p>
                )}
              </div>
            </div>
          )}
        </QueryBoundary>
        {!activeOptions.length && (
          <p className="m-0 text-xs text-tertiary">
            {copy.noResponsesDescription}
          </p>
        )}
        <div className="gp-milestone-card__actions">
          <Button
            className="px-3 py-2"
            disabled={!activeOptions.length}
            onClick={() => setEditor(true)}
          >
            <UiIcon name="plus" className="size-4" />
            {copy.recordShortAction}
          </Button>
          <Button
            variant="ghost"
            className="px-3 py-2"
            onClick={() => setHistory(true)}
          >
            <UiIcon name="clock" className="size-4" />
            {copy.historyShortAction}
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-secondary pt-2">
          <Button variant="ghost" className="px-2 py-2" asChild>
            <Link
              href={`/tips?milestone_id=${encodeURIComponent(milestone.id)}`}
            >
              {copy.browseMilestoneTips}
              <UiIcon name="arrowRight" className="size-4" />
            </Link>
          </Button>
          <SavedContentButton
            contentType="MILESTONE"
            contentId={milestone.id}
            variant="ghost"
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
