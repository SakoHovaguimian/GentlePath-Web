import { useId } from 'react';
import { Field, MultiSelect, QueryBoundary } from '@/components/ui';
import { gentlePathLinkedContentStrings as copy } from '@/strings';
import { useMilestoneChoices } from '../hooks';

export function MilestoneLinksField({
  value,
  onChange,
  disabled = false,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const choices = useMilestoneChoices();
  const descriptionId = useId();
  return (
    <div className="grid gap-2">
      <QueryBoundary query={choices}>
        {(milestones) => {
          const available = new Set(
            milestones.map((milestone) => milestone.id),
          );
          const unavailable = value.filter((id) => !available.has(id));
          return (
            <>
              <Field labelText={copy.label}>
                <MultiSelect
                  value={value}
                  options={[
                    ...milestones.map((milestone) => ({
                      value: milestone.id,
                      label: milestone.milestone,
                    })),
                    ...unavailable.map((id, index) => ({
                      value: id,
                      label: copy.unavailableMilestone(index + 1),
                    })),
                  ]}
                  onValueChange={onChange}
                  maxSelections={10}
                  disabled={disabled}
                  label={copy.label}
                  placeholder={milestones.length ? copy.choose : copy.noChoices}
                  selectionLabel={copy.selection}
                  clearLabel={copy.clear}
                  aria-describedby={descriptionId}
                />
              </Field>
              {unavailable.length > 0 && (
                <p className="m-0 text-sm text-tertiary">{copy.unavailable}</p>
              )}
            </>
          );
        }}
      </QueryBoundary>
      <p id={descriptionId} className="m-0 text-sm text-tertiary">
        {copy.description}
      </p>
    </div>
  );
}
