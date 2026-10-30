'use client';

import {
  Card,
  CardOpenButton,
  IconMenu,
  InitialsAvatar,
  UiIcon,
} from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { ChildProfile } from '../models/childProfile';
import { formatChildAge, formatChildBirthDate } from '../formatChildAge';
import { childSupportQuestions } from '../childSupportQuestions';

interface FamilyProfileCardProps {
  child: ChildProfile;
  removing: boolean;
  onOpen: () => void;
  onRemove: () => void;
}

export function FamilyProfileCard({
  child,
  removing,
  onOpen,
  onRemove,
}: FamilyProfileCardProps) {
  const summaryQuestion = childSupportQuestions.find(
    ({ key }) => child.supportDetails[key],
  );
  const summary = summaryQuestion
    ? child.supportDetails[summaryQuestion.key]
    : child.supportNotes;
  return (
    <Card className="gp-family-card">
      <div className="gp-family-card__header">
        <InitialsAvatar name={child.name} />
        <div className="grid min-w-0 flex-1 gap-1.5">
          <h2>
            <CardOpenButton
              className="gp-family-card__open"
              disabled={removing}
              onClick={onOpen}
              aria-label={copy.family.openProfile(child.name)}
            >
              {child.name}
            </CardOpenButton>
          </h2>
          <p className="gp-family-card__age">
            {formatChildAge(child.dateOfBirth)}
          </p>
        </div>
        <div className="gp-family-card__menu">
          <IconMenu
            label={copy.family.profileActions(child.name)}
            disabled={removing}
            items={[
              { id: 'edit', icon: 'file', label: copy.common.edit },
              {
                id: 'remove',
                icon: 'trash',
                label: copy.family.deleteAction,
                variant: 'destructive',
              },
            ]}
            onAction={(action) => {
              if (action === 'edit') onOpen();
              else onRemove();
            }}
          />
        </div>
      </div>
      <div className="gp-family-card__birth">
        <UiIcon name="calendar" className="size-4" />
        <span className="grid gap-1">
          <span className="text-xs text-tertiary">
            {copy.family.birthDateLabel}
          </span>
          <time dateTime={child.dateOfBirth}>
            {formatChildBirthDate(child.dateOfBirth)}
          </time>
        </span>
      </div>
      <div className="gp-family-card__summary">
        <UiIcon name={summaryQuestion?.icon ?? 'leaf'} className="size-5" />
        <div className="grid min-w-0 gap-1.5">
          <p className="gp-family-card__question">
            {summaryQuestion
              ? copy.family.questions[summaryQuestion.key].label
              : copy.family.notesLabel}
          </p>
          <p className="gp-family-card__notes">
            {summary || copy.family.noNotesHint}
          </p>
        </div>
      </div>
    </Card>
  );
}
