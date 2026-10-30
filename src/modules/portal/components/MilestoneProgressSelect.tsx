'use client';

import { useId, useRef } from 'react';
import { Field, Select } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useSaveMilestoneObservation } from '@/modules/milestone-admin/hooks';
import type { MilestoneGuidance } from '@/modules/milestone-admin/models/milestoneGuidance';
import type { MilestoneObservation } from '@/modules/milestone-admin/models/milestoneObservation';
import { MutationError } from './MutationError';
const unrecordedChoice = '';

export function MilestoneProgressSelect({
  milestone,
  childId,
  latest,
  disabled = false,
}: {
  milestone: MilestoneGuidance;
  childId: string;
  latest?: MilestoneObservation;
  disabled?: boolean;
}) {
  const save = useSaveMilestoneObservation();
  const { showToast } = usePresentationService();
  const busy = useRef(false);
  const id = useId();
  const options = (milestone.response_options ?? []).filter(
    (option) => !option.deleted,
  );
  const retired = latest?.response_option?.deleted
    ? latest.response_option
    : undefined;
  return (
    <div className="grid min-w-0 gap-2" aria-busy={save.isPending}>
      <Field labelText={copy.progressLabel}>
        <Select
          id={id}
          value={latest?.response_option_id ?? ''}
          disabled={disabled || save.isPending || !options.length}
          aria-describedby={save.error ? `${id}-error` : undefined}
          onValueChange={async (responseOptionId) => {
            if (
              !responseOptionId ||
              busy.current ||
              responseOptionId === latest?.response_option_id
            )
              return;
            busy.current = true;
            try {
              await save.mutateAsync({
                input: {
                  child_id: childId,
                  milestone_id: milestone.id,
                  response_option_id: responseOptionId,
                  observed_at: new Date().toISOString(),
                  notes: null,
                },
              });
              void showToast({ title: copy.statusRecorded, intent: 'success' });
            } catch {
              /* The last confirmed selection remains available for retry. */
            } finally {
              busy.current = false;
            }
          }}
        >
          <option value={unrecordedChoice} disabled={Boolean(latest)}>
            {copy.progressStates.unrecorded}
          </option>
          {retired && (
            <option value={retired.id}>
              {copy.retiredOption(retired.label)}
            </option>
          )}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      {!options.length && (
        <p className="m-0 text-xs text-tertiary">
          {copy.noResponsesDescription}
        </p>
      )}
      <MutationError id={`${id}-error`} error={save.error} />
    </div>
  );
}
