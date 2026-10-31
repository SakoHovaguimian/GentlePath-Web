import { NotFoundError } from '@/errors/domainErrors';
import { errorResponse } from '@/services/api/routeSafety';
import { readDemoPublicImage } from '@/services/demo/demoPublicImages';
import { getEffectiveRuntime } from '@/services/demo/demoRuntime';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await getEffectiveRuntime()).demoMode) throw new NotFoundError();
    return readDemoPublicImage((await context.params).id);
  } catch (error) {
    return errorResponse(error);
  }
}
