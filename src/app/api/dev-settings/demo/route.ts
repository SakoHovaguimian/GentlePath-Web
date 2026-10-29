import { cookies } from 'next/headers';
import { NotFoundError, OwnershipError } from '@/errors/domainErrors';
import { errorResponse, trustedMutation } from '@/services/api/routeSafety';
import {
  isDevSettingsAvailable,
  writeDemoSettings,
} from '@/services/demo/demoRuntime';
import { sessionCookieName } from '@/services/session/sessionCodec';
import { gentlePathDemoStrings } from '@/strings';

export async function POST(request: Request) {
  try {
    if (!isDevSettingsAvailable())
      throw new NotFoundError(gentlePathDemoStrings.unavailable);
    if (!trustedMutation(request)) throw new OwnershipError();
    await writeDemoSettings({
      demoMode: true,
      scenario: 'populated',
      latencyMs: 350,
    });
    (await cookies()).delete(sessionCookieName);
    return Response.json(
      { demoMode: true },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
