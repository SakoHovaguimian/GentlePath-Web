import { ContactService } from '@/modules/contact/services/contactService';
import { BrowserApiClient } from '@/services/api/browserApiClient';
import { EngagementService } from '@/modules/engagement/services/engagementService';
import { ThemePreferenceService } from '@/modules/settings/services/themePreferenceService';

export function createPublicThemePreferenceService() {
  return new ThemePreferenceService();
}

/** Optional account actions must never interrupt an anonymous article read. */
export function createPublicEngagementService() {
  return new EngagementService(
    new BrowserApiClient('/api/backend', { redirectOnUnauthorized: false }),
  );
}

export function createPublicContactService() {
  return new ContactService(
    new BrowserApiClient('/api/public', { redirectOnUnauthorized: false }),
  );
}
