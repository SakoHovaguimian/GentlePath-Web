import { addressCountries } from '@/strings';
import { addressTimezoneCountries } from './addressTimezoneCountries';

export function addressRegions(country: string) {
  return addressCountries.find((item) => item.code === country)?.regions ?? [];
}

// Timezones indicate a broad area, not an exact physical location.
const timezoneRegions: Record<string, string> = {
  'America/Los_Angeles': 'CA',
  'America/New_York': 'NY',
  'America/Chicago': 'IL',
  'America/Denver': 'CO',
  'America/Phoenix': 'AZ',
  'America/Detroit': 'MI',
  'America/Indiana/Indianapolis': 'IN',
  'America/Anchorage': 'AK',
  'Pacific/Honolulu': 'HI',
  'America/Toronto': 'ON',
  'America/Vancouver': 'BC',
  'America/Edmonton': 'AB',
  'America/Winnipeg': 'MB',
  'America/Regina': 'SK',
  'America/Halifax': 'NS',
  'America/St_Johns': 'NL',
  'America/Whitehorse': 'YT',
  'America/Yellowknife': 'NT',
  'America/Iqaluit': 'NU',
};
export function browserAddressDefaults() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const country = addressTimezoneCountries[timezone] ?? 'US';
  const regions = addressRegions(country);
  const region = regions.find(
    (item) => item.code === timezoneRegions[timezone],
  );
  const city = timezone?.split('/').at(-1)?.replaceAll('_', ' ');
  return {
    country,
    region:
      region?.code ?? regions.find((item) => item.name === city)?.code ?? '',
  };
}
