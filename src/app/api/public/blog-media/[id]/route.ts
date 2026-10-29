import { NotFoundError } from '@/errors/domainErrors';
import { errorResponse } from '@/services/api/routeSafety';
import { readDemoBlogImage } from '@/services/demo/demoBlogMedia';
import { getEffectiveRuntime } from '@/services/demo/demoRuntime';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await getEffectiveRuntime()).demoMode) throw new NotFoundError();
    return readDemoBlogImage((await context.params).id);
  } catch (error) {
    return errorResponse(error);
  }
}
