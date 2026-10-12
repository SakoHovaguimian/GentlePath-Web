'use client';

import { addressCountries, strings } from '@/strings';
import { addressRegions } from '../lib/addressChoices';
import type { SelectProps } from '../models/selectProps';
import { Select } from './Select';

export function AddressSelect({
  kind,
  country = '',
  value,
  ...props
}: Omit<SelectProps, 'children'> & {
  kind: 'country' | 'region';
  country?: string;
}) {
  const copy = strings.address;
  const emptyCode = '';
  const choices =
    kind === 'country' ? addressCountries : addressRegions(country);
  // Existing names/codes remain selectable without rewriting saved addresses.
  const saved = String(value ?? '');
  const matched = choices.find(
    (item) => item.code === saved || item.name === saved,
  );
  return (
    <Select
      {...props}
      value={saved}
      autoComplete={kind === 'country' ? 'country' : 'address-level1'}
    >
      <option value={emptyCode}>
        {kind === 'country'
          ? copy.chooseCountry
          : country && !choices.length
            ? copy.noRegions
            : copy.chooseRegion}
      </option>
      {saved && !matched && <option value={saved}>{saved}</option>}
      {choices.map((item) => (
        <option key={item.code} value={matched === item ? saved : item.code}>
          {kind === 'country'
            ? copy.countryOption(item.name, item.code)
            : item.name}
        </option>
      ))}
    </Select>
  );
}
