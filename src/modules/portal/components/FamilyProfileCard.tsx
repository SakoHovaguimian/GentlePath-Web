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
  const answeredQuestions = childSupportQuestions.filter(({ key }) =>
    child.supportDetails[key].trim(),
  );
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
      {child.gender && (
        <div className="gp-family-card__gender">
          <span className="text-xs text-tertiary">
            {copy.family.genderLabel}
          </span>
          <span>{copy.family.genders[child.gender]}</span>
        </div>
      )}
      <div className="gp-family-card__details">
        {answeredQuestions.map((question) => (
          <div className="gp-family-card__summary" key={question.key}>
            <UiIcon name={question.icon} className="size-5" />
            <div className="grid min-w-0 gap-1.5">
              <h3 className="gp-family-card__question">
                {copy.family.questions[question.key].label}
              </h3>
              <p className="gp-family-card__notes">
                {child.supportDetails[question.key]}
              </p>
            </div>
          </div>
        ))}
        {child.supportNotes.trim() && (
          <div className="gp-family-card__summary">
            <UiIcon name="leaf" className="size-5" />
            <div className="grid min-w-0 gap-1.5">
              <h3 className="gp-family-card__question">
                {copy.family.notesLabel}
              </h3>
              <p className="gp-family-card__notes">{child.supportNotes}</p>
            </div>
          </div>
        )}
        {!answeredQuestions.length && !child.supportNotes.trim() && (
          <p className="gp-family-card__notes">{copy.family.noNotesHint}</p>
        )}
      </div>
    </Card>
  );
}
