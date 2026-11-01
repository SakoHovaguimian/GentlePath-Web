import { useState } from 'react';
import { Button, Card, CardOpenButton, Field, Select } from '@/components/ui';
import { useNotificationSettings } from '@/modules/notification-inbox/hooks';
import { useChildren } from '@/modules/portal/hooks';
import { useMilestoneChoices } from '@/modules/milestone-admin/hooks';
import {
  addressCountries,
  gentlePathCommunityDiscoveryStrings as copy,
} from '@/strings';
import { AgeBandSchema, childAgeBand } from '../models/ageBand';
import { PostKindSchema } from '../models/postKind';
import type { useCommunityDirectory } from '../useCommunityDirectory';

const allFilter = '';

export function CommunityDiscoveryFilters({
  directory,
  onStart,
}: {
  directory: ReturnType<typeof useCommunityDirectory>;
  onStart: (title: string) => void;
}) {
  const children = useChildren();
  const timezone = useNotificationSettings();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const selectedChild =
    selectedChildId === null
      ? children.data?.[0]
      : children.data?.find((child) => child.id === selectedChildId);
  const milestones = useMilestoneChoices();
  const states =
    addressCountries.find((country) => country.code === 'US')?.regions ?? [];
  const change = (key: string, value: string) =>
    directory.update({ [key]: value || undefined, offset: undefined });
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-3">
        <Button
          variant={!directory.postKind ? 'primary' : 'secondary'}
          onClick={() =>
            directory.update({
              kind: undefined,
              age: undefined,
              offset: undefined,
            })
          }
        >
          {copy.allPosts}
        </Button>
        <Button
          variant={
            directory.postKind === 'EXPERIENCE' ? 'primary' : 'secondary'
          }
          onClick={() =>
            directory.update({ kind: 'EXPERIENCE', offset: undefined })
          }
        >
          {copy.experiences}
        </Button>
        <Button
          variant={directory.postKind === 'WIN' ? 'primary' : 'secondary'}
          disabled={Boolean(selectedChild) && !timezone.data}
          onClick={() =>
            directory.update({
              kind: 'WIN',
              age: selectedChild
                ? childAgeBand(
                    selectedChild.dateOfBirth,
                    timezone.data?.effectiveTimezone ?? 'UTC',
                  )
                : undefined,
              offset: undefined,
            })
          }
        >
          {copy.smallWins}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field labelText={copy.postKind}>
          <Select
            value={directory.postKind ?? ''}
            onValueChange={(value) => change('kind', value)}
          >
            <option value={allFilter}>{copy.allKinds}</option>
            {PostKindSchema.options.map((kind) => (
              <option key={kind} value={kind}>
                {copy.kinds[kind]}
              </option>
            ))}
          </Select>
        </Field>
        <Field labelText={copy.ageBand}>
          <Select
            value={directory.ageBand ?? ''}
            onValueChange={(value) => change('age', value)}
          >
            <option value={allFilter}>{copy.allAges}</option>
            {AgeBandSchema.options.map((age) => (
              <option key={age} value={age}>
                {copy.ages[age]}
              </option>
            ))}
          </Select>
        </Field>
        <Field labelText={copy.state}>
          <Select
            value={directory.stateCode ?? ''}
            onValueChange={(value) => change('state', value)}
          >
            <option value={allFilter}>{copy.allStates}</option>
            {states.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field labelText={copy.milestone}>
          <Select
            value={directory.milestoneId ?? ''}
            onValueChange={(value) => change('milestone', value)}
          >
            <option value={allFilter}>{copy.allMilestones}</option>
            {(milestones.data ?? []).map((milestone) => (
              <option key={milestone.id} value={milestone.id}>
                {milestone.milestone}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {directory.postKind === 'WIN' && Boolean(children.data?.length) && (
        <Field labelText={copy.defaultAgeContext}>
          <Select
            value={selectedChild?.id ?? allFilter}
            onValueChange={(value) => {
              setSelectedChildId(value);
              const child = children.data?.find((item) => item.id === value);
              directory.update({
                age: child
                  ? childAgeBand(
                      child.dateOfBirth,
                      timezone.data?.effectiveTimezone ?? 'UTC',
                    )
                  : undefined,
                offset: undefined,
              });
            }}
          >
            <option value={allFilter}>{copy.allAges}</option>
            {(children.data ?? []).map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </Select>
        </Field>
      )}
      {directory.postKind === 'EXPERIENCE' && (
        <div className="grid gap-3">
          <p className="m-0 text-sm text-secondary">{copy.experiencesHint}</p>
          <div className="grid gap-3 md:grid-cols-3">
            {copy.starters.map((title) => (
              <Card key={title} className="relative">
                <CardOpenButton
                  aria-label={title}
                  onClick={() => onStart(title)}
                />
                <p className="m-0 font-display text-lg text-primary">{title}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
