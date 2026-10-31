import { Field, Select } from '@/components/ui';
import { addressRegions } from '@/components/ui/lib/addressChoices';
import { gentlePathOnboardingStrings as copy } from '@/strings';
import { USStateCodeSchema } from '../models/usStateCode';

const unsetState = '';
const supportedStates = addressRegions('US').filter(
  (state) => USStateCodeSchema.safeParse(state.code).success,
);

export function StateField({
  value,
  onChange,
  disabled = false,
  errorId,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  errorId?: string;
}) {
  return (
    <div data-state-field>
      <Field labelText={copy.state}>
        <Select
          name="state"
          value={value}
          onValueChange={onChange}
          disabled={disabled}
          required
          aria-invalid={Boolean(errorId)}
          aria-describedby={errorId}
        >
          <option value={unsetState}>{copy.chooseState}</option>
          {supportedStates.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
