import { BrowserApiClient } from '@/services/api/browserApiClient';
import { EngagementService } from '@/modules/engagement/services/engagementService';

/** Optional account actions must never interrupt an anonymous article read. */
export function createPublicEngagementService() {
  return new EngagementService(
    new BrowserApiClient('/api/backend', { redirectOnUnauthorized: false }),
  );
}
