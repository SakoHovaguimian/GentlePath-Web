'use client';

import { strings } from '@/strings';
import { timezoneChoices } from '../lib/timezoneChoices';
import type { SelectProps } from '../models/selectProps';
import { Select } from './Select';

export function TimezoneSelect({
  value,
  ...props
}: Omit<SelectProps, 'children'>) {
  const emptyCode = '';
  const selected = String(value ?? emptyCode);
  return (
    <Select {...props} value={selected}>
      <option value={emptyCode}>{strings.address.chooseTimezone}</option>
      {selected && !timezoneChoices.some((item) => item.code === selected) && (
        <option value={selected} disabled>
          {strings.address.savedTimezone(selected)}
        </option>
      )}
      {timezoneChoices.map((item) => (
        <option key={item.code} value={item.code}>
          {item.label}
        </option>
      ))}
    </Select>
  );
}
