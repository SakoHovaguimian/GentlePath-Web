'use client';

import { Button, Card, InitialsAvatar, UiIcon } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { ChildProfile } from '../models/childProfile';
import { formatChildAge, formatChildBirthDate } from '../formatChildAge';

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
  return (
    <Card className="gp-family-card">
      <div className="gp-family-card__header">
        <InitialsAvatar name={child.name} />
        <span className="gp-family-card__private">
          <UiIcon name="lock" className="size-4" />
          {copy.common.private}
        </span>
      </div>
      <div className="grid gap-2">
        <h2>
          <Button
            variant="ghost"
            className="gp-family-card__open"
            onClick={onOpen}
            aria-label={copy.family.openProfile(child.name)}
          >
            {child.name}
          </Button>
        </h2>
        <p className="gp-family-card__age">
          {formatChildAge(child.dateOfBirth)}
        </p>
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
      <p className="gp-family-card__notes">
        {child.supportNotes || copy.family.noNotesHint}
      </p>
      <div className="gp-family-card__footer">
        <span
          className="flex items-center gap-2 text-sm font-semibold text-brand-secondary"
          aria-hidden="true"
        >
          {copy.family.profileAction}
          <UiIcon name="arrowRight" className="size-4" />
        </span>
        <Button
          variant="destructive"
          className="relative z-10 size-11 shrink-0 px-0"
          disabled={removing}
          aria-label={copy.family.removeProfile(child.name)}
          onClick={onRemove}
        >
          <UiIcon name="trash" className="size-4" />
        </Button>
      </div>
    </Card>
  );
}
