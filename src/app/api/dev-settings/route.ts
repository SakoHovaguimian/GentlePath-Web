import { DemoSettingsInputSchema } from '@/models/demoSettings';
import { errorResponse } from '@/services/api/routeSafety';
import { requireDeveloperAccess } from '@/services/demo/demoDevAccess';
import { getDemoContext, writeDemoSettings } from '@/services/demo/demoRuntime';

export async function GET() {
  try {
    const { runtime, session } = await requireDeveloperAccess();
    return Response.json(
      {
        ...(await getDemoContext()),
        demoMode: runtime.demoMode,
        enabled: true,
        role: session.user.role,
      },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { runtime, container } = await requireDeveloperAccess(request);
    const input = DemoSettingsInputSchema.parse(await request.json());
    await writeDemoSettings(input);
    const reload = input.demoMode !== runtime.demoMode;
    if (reload) await container.sessionService.delete();
    return Response.json(
      { reload },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
