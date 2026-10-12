import { addressTimezoneCountries } from './addressTimezoneCountries';
import { strings } from '@/strings';

const labels = strings.address;
export const featuredTimezones = [
  { code: 'America/Detroit', label: labels.timezones.eastern },
  { code: 'America/Chicago', label: labels.timezones.central },
  { code: 'America/Denver', label: labels.timezones.mountain },
  { code: 'America/Phoenix', label: labels.timezones.arizona },
  { code: 'America/Los_Angeles', label: labels.timezones.pacific },
  { code: 'America/Anchorage', label: labels.timezones.alaska },
  { code: 'Pacific/Honolulu', label: labels.timezones.hawaii },
  { code: 'America/Halifax', label: labels.timezones.atlantic },
  { code: 'America/St_Johns', label: labels.timezones.newfoundland },
];

// Every supported IANA timezone is available; keep the familiar named aliases.
const supported = new Set([
  ...Intl.supportedValuesOf('timeZone'),
  ...Object.keys(addressTimezoneCountries),
  ...featuredTimezones.map((item) => item.code),
]);
export function defaultPortalTimezone() {
  const code = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return supported.has(code) ? code : 'UTC';
}
supported.add('UTC');

export const timezoneChoices = Array.from(supported)
  .sort()
  .map((code) => ({
    code,
    label: strings.address.timezoneOption(
      featuredTimezones.find((item) => item.code === code)?.label,
      code,
    ),
  }));
