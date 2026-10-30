import 'server-only';
import { handleLiveJournalRequest } from '@/modules/portal/server/handleLiveJournalRequest';
import { handleLiveAdministrationRequest } from '@/modules/portal/server/handleLiveAdministrationRequest';
import { handleLiveDocumentVaultRequest } from '@/modules/documents/server/handleLiveDocumentVaultRequest';
import { handleLiveCommunityRequest } from '@/modules/community/server/handleLiveCommunityRequest';
import { handleLiveBlogMediaRequest } from '@/modules/blog/server/handleLiveBlogMediaRequest';
import type { BackendForward } from './models/backendForward';
import { portalFamilyReads } from './portalFamilyReads';
import { handleLivePollRequest } from '@/modules/polls/server/handleLivePollRequest';
import { handleLiveEditorialRequest } from '@/modules/editorial/server/handleLiveEditorialRequest';
import { handleLiveEngagementRequest } from '@/modules/engagement/server/handleLiveEngagementRequest';
import { handleLiveMilestoneAdminRequest } from '@/modules/milestone-admin/server/handleLiveMilestoneAdminRequest';
import { handleLiveAccountToolsRequest } from '@/modules/account-tools/server/handleLiveAccountToolsRequest';
import type { UserRole } from '@/models/userRole';
import { handleLiveCommercialRequest } from '@/modules/commercial/server/liveCommercialApi';
import { handleLiveNotificationInboxRequest } from '@/modules/notification-inbox/server/handleLiveNotificationInboxRequest';

export async function featureBackendProxy(
  request: Request,
  path: string,
  forward: BackendForward,
  userId: string,
  role: UserRole,
): Promise<Response | null> {
  return (
    (await handleLiveAdministrationRequest(request, path, forward)) ??
    (await handleLiveBlogMediaRequest(request, path, forward)) ??
    (await portalFamilyReads(request, path, forward)) ??
    (await handleLiveJournalRequest(request, path, forward, userId)) ??
    (await handleLiveDocumentVaultRequest(request, path, forward)) ??
    (await handleLiveCommunityRequest(request, path, forward, userId)) ??
    (await handleLivePollRequest(request, path, forward, userId)) ??
    (await handleLiveEditorialRequest(request, path, forward, userId)) ??
    (await handleLiveEngagementRequest(request, path, forward, userId)) ??
    (await handleLiveMilestoneAdminRequest(request, path, forward, userId)) ??
    (await handleLiveAccountToolsRequest(
      request,
      path,
      forward,
      userId,
      role,
    )) ??
    (await handleLiveCommercialRequest(request, path, forward, userId, role)) ??
    handleLiveNotificationInboxRequest(request, path, forward, userId)
  );
}
