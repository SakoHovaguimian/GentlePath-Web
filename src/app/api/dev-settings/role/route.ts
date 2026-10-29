import { z } from 'zod';
import { UserRoleSchema } from '@/models/userRole';
import { errorResponse } from '@/services/api/routeSafety';
import { requireDeveloperAccess } from '@/services/demo/demoDevAccess';
import { createDemoIdentitySession } from '@/services/demo/demoIdentity';

const InputSchema = z.object({ role: UserRoleSchema }).strict();

export async function POST(request: Request) {
  try {
    const { container } = await requireDeveloperAccess(request, true);
    const { role } = InputSchema.parse(await request.json());
    const session = await createDemoIdentitySession(role);
    await container.sessionService.create(session);
    return Response.json(container.sessionService.toPublic(session), {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
