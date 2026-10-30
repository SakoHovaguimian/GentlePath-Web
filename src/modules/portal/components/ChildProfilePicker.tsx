import { Button, UiIcon } from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { ChildProfile } from '../models/childProfile';

export function ChildProfilePicker({
  profiles,
  value,
  onValueChange,
  disabled = false,
  label = copy.milestones.childLabel,
}: {
  profiles: readonly Pick<ChildProfile, 'id' | 'name'>[];
  value: string;
  onValueChange: (id: string) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <span className="text-sm font-medium text-secondary">{label}</span>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {profiles.map((child) => (
          <Button
            key={child.id}
            variant="secondary"
            disabled={disabled}
            aria-pressed={value === child.id}
            className="ui-chip gap-2 aria-pressed:border-brand aria-pressed:bg-brand-primary aria-pressed:text-brand-secondary"
            onClick={() => onValueChange(child.id)}
          >
            <UiIcon
              name={value === child.id ? 'check' : 'user'}
              className="size-4"
            />
            {child.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
