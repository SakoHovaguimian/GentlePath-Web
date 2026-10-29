import { errorResponse } from '@/services/api/routeSafety';
import { requireDeveloperAccess } from '@/services/demo/demoDevAccess';
import { createDemoIdentitySession } from '@/services/demo/demoIdentity';
import { resetDemoState } from '@/services/demo/demoState';
import { resetDemoPortalState } from '@/services/demo/demoPortalState';
import { resetDemoBlogState } from '@/services/demo/demoBlogState';
import { getDemoContext, writeDemoSettings } from '@/services/demo/demoRuntime';

export async function POST(request: Request) {
  try {
    const { container, session } = await requireDeveloperAccess(request, true);
    resetDemoState();
    resetDemoPortalState();
    resetDemoBlogState();
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
