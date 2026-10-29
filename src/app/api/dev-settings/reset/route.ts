import { errorResponse } from '@/services/api/routeSafety';
import { requireDeveloperAccess } from '@/services/demo/demoDevAccess';
import { createDemoIdentitySession } from '@/services/demo/demoIdentity';
import { resetDemoState } from '@/services/demo/demoState';
import { resetDemoPortalState } from '@/services/demo/demoPortalState';
import { resetDemoBlogState } from '@/services/demo/demoBlogState';
import { resetDocumentVaultDemoState } from '@/modules/documents/demo/documentVaultDemoState';
import { resetDemoCommunityState } from '@/modules/community/demo/communityState';
import { resetDemoPollState } from '@/modules/polls/demo/pollState';
import { resetDemoEditorialState } from '@/modules/editorial/server/handleDemoEditorialRequest';
import { resetDemoEngagementState } from '@/modules/engagement/demo/handleEngagementRequest';
import { resetDemoMilestoneAdminState } from '@/modules/milestone-admin/server/handleMilestoneAdminRequest';
import { resetDemoAccountToolsState } from '@/modules/account-tools/demo/accountToolsState';
import { resetDemoCommercialState } from '@/modules/commercial/server/demoCommercialApi';
import { resetDemoNotificationInboxState } from '@/modules/notification-inbox/demo/handleNotificationInboxRequest';
import { getDemoContext, writeDemoSettings } from '@/services/demo/demoRuntime';

export async function POST(request: Request) {
  try {
    const { container, session } = await requireDeveloperAccess(request, true);
    resetDemoState();
    resetDemoPortalState();
    resetDemoBlogState();
    resetDocumentVaultDemoState();
    resetDemoCommunityState();
    resetDemoPollState();
    resetDemoEditorialState();
    resetDemoMilestoneAdminState();
    resetDemoEngagementState();
    resetDemoAccountToolsState();
    resetDemoCommercialState();
    resetDemoNotificationInboxState();
    await writeDemoSettings({
      ...(await getDemoContext()),
      demoMode: true,
      scenario: 'populated',
    });
    const restored = await createDemoIdentitySession(session.user.role);
    await container.sessionService.create(restored);
    return Response.json(container.sessionService.toPublic(restored), {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
