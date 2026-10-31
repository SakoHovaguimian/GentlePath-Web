import '../styles/discovery-preferences.css';
import { Checkbox } from '@/components/ui';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import {
  DiscoveryApproachSchema,
  type DiscoveryApproach,
} from '../models/discoveryApproach';
import type { DiscoveryPreferencesInput } from '../models/discoveryPreferencesInput';

export function DiscoveryPreferencesFields({
  value,
  onChange,
  disabled = false,
  showIntroduction = true,
}: {
  value: DiscoveryPreferencesInput;
  onChange: (value: DiscoveryPreferencesInput) => void;
  disabled?: boolean;
  showIntroduction?: boolean;
}) {
  function toggle(approach: DiscoveryApproach, checked: boolean) {
    onChange({
      no_preference: false,
      approaches: checked
        ? [...value.approaches, approach]
        : value.approaches.filter((item) => item !== approach),
    });
  }
  return (
    <fieldset disabled={disabled} className="gp-discovery-fields">
      <legend
        className={
          showIntroduction ? 'mb-3 text-sm font-medium text-primary' : 'sr-only'
        }
      >
        {copy.steps.DISCOVERY}
      </legend>
      {showIntroduction && (
        <p className="mb-4 text-sm text-tertiary">{copy.discoveryHint}</p>
      )}
      <div className="gp-discovery-options">
        {DiscoveryApproachSchema.options.map((approach) => (
          <Checkbox
            key={approach}
            label={copy.approachLabels[approach]}
            description={copy.approachDescriptions[approach]}
            className="gp-discovery-choice"
            checked={value.approaches.includes(approach)}
            onChange={(event) => toggle(approach, event.target.checked)}
          />
        ))}
        <Checkbox
          label={copy.noPreference}
          className="gp-discovery-choice gp-discovery-choice-open"
          description={copy.noPreferenceHint}
          checked={value.no_preference}
          onChange={(event) =>
            onChange({ approaches: [], no_preference: event.target.checked })
          }
        />
      </div>
    </fieldset>
  );
}
