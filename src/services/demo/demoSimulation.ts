import 'server-only';
import { ApiError } from '@/errors/domainErrors';
import type { DemoContext } from '@/models/demoContext';
import { gentlePathDemoStrings } from '@/strings';

export async function simulateDemoRequest(context: DemoContext) {
  const delay =
    context.scenario === 'loading'
      ? Math.max(context.latencyMs, 2500)
      : context.latencyMs;
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  if (context.scenario === 'error')
    throw new ApiError(gentlePathDemoStrings.simulatedError, 503);
}
