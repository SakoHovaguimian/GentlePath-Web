'use client';

import { useState } from 'react';
import { Badge, Button, Card, NavigationLink, UiIcon } from '@/components/ui';
import { gentlePathApplicationStrings as copy } from '@/strings';
import type { ServiceApplication } from '../models/serviceApplication';
import { nextApplicationFollowUp } from '../nextApplicationFollowUp';
import { ApplicationCountdown } from './ApplicationCountdown';
import { FollowUpEditor } from './FollowUpEditor';
import type { ApplicationFollowUp } from '../models/applicationFollowUp';
import { useFollowUpCompletion } from '../useFollowUpCompletion';
import { MutationError } from '@/modules/portal/components/MutationError';

export function ApplicationCard({
  application,
  childName,
  compact = false,
  followUp: selectedFollowUp,
  completable = false,
}: {
  application: ServiceApplication;
  childName?: string;
  compact?: boolean;
  followUp?: ApplicationFollowUp;
  completable?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const followUp = selectedFollowUp ?? nextApplicationFollowUp(application);
  const { mutation: completion, complete } = useFollowUpCompletion(followUp);
  const Heading = compact ? 'h3' : 'h2';
  return (
    <Card className="gp-application-card" data-compact={compact || undefined}>
      <div className="gp-application-card__body">
        <div className="gp-application-card__meta">
          <Badge intent="brand">{copy.statuses[application.status]}</Badge>
          <span>
            {childName ??
              (application.child_id ? copy.childLabel : copy.personalOption)}
          </span>
        </div>
        <Heading className="gp-application-card__title">
          <NavigationLink
            className="ui-card-open"
            href={`/applications/${application.id}`}
          >
            {application.title}
          </NavigationLink>
        </Heading>
        <p className="gp-application-card__provider">
          {application.provider || copy.providerEmpty}
        </p>
        {!compact && application.applied_on && (
          <div className="gp-application-card__applied">
            <UiIcon name="calendar" className="size-4" />
            <span>{copy.appliedLabel}</span>
            <time dateTime={application.applied_on}>
              {copy.dateDescription(application.applied_on)}
            </time>
          </div>
        )}
      </div>
      <div className="gp-application-card__next">
        <div className="gp-application-card__next-copy">
          <span className="gp-application-card__eyebrow">
            {copy.nextStepTitle}
          </span>
          <p>
            {followUp
              ? followUp.notes || copy.nextStepNotesEmpty
              : copy.nextStepEmptyHint}
          </p>
        </div>
        <ApplicationCountdown followUp={followUp} />
      </div>
      <div className="gp-application-card__footer">
        {completable && followUp ? (
          <Button
            className="gp-application-card__action"
            loading={completion.isPending}
            onClick={() => void complete()}
          >
            <UiIcon name="check" className="size-4" />
            {copy.completeAction}
          </Button>
        ) : (
          <span className="gp-application-card__footer-hint">
            <UiIcon name="file" className="size-4" />
            {copy.viewAction}
            <UiIcon name="arrowRight" className="size-4" />
          </span>
        )}
        <Button
          variant="secondary"
          className="gp-application-card__action"
          disabled={completion.isPending}
          onClick={() => setAdding(true)}
        >
          <UiIcon name="plus" className="size-4" />
          {copy.followUpAdd}
        </Button>
      </div>
      {completion.error && (
        <div className="gp-application-card__error">
          <MutationError error={completion.error} />
        </div>
      )}
      {adding && (
        <FollowUpEditor
          applicationId={application.id}
          onClose={() => setAdding(false)}
        />
      )}
    </Card>
  );
}
