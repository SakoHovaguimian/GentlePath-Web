import { z } from 'zod';
import { getContainer } from '@/container';
import { LoginInputSchema, SignupInputSchema } from '@/models/auth';
import { AuthError, OwnershipError } from '@/errors/domainErrors';
import { getProfileSession } from '@/services/auth/profileSession';
import { errorResponse, trustedMutation } from '@/services/api/routeSafety';
import { strings } from '@/strings';
const InputSchema = z.discriminatedUnion('action', [
  LoginInputSchema.extend({ action: z.literal('login') }),
  SignupInputSchema.extend({ action: z.literal('signup') }),
]);
export async function POST(request: Request) {
  try {
    const container = await getContainer();
    if (!trustedMutation(request))
      throw new OwnershipError(strings.errors.untrusted);
    const input = InputSchema.parse(await request.json());
    const auth =
      input.action === 'signup'
        ? await container.firebaseAuthService.signUp(input)
        : await container.firebaseAuthService.signIn(
            input.email,
            input.password,
          );
    if (input.action === 'signup' && !container.demoMode) {
      await container.apiClient.request('/users', auth.idToken, {
        method: 'POST',
        body: {
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          external_id: auth.externalId,
        },
      });
    }
    const session = {
      auth,
      user: await getProfileSession(auth),
      demo: container.demoMode,
    };
    await container.sessionService.create(session);
    return Response.json(container.sessionService.toPublic(session), {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function GET() {
  try {
    const container = await getContainer();
    const session = await container.sessionService.valid();
    if (!session) throw new AuthError(strings.errors.sessionExpired);
    return Response.json(container.sessionService.toPublic(session), {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function PUT(request: Request) {
  try {
    const container = await getContainer();
    if (!trustedMutation(request))
      throw new OwnershipError(strings.errors.untrusted);
    const session = await container.sessionService.valid();
    if (!session) throw new AuthError(strings.errors.sessionExpired);
    const updated = { ...session, user: await getProfileSession(session.auth) };
    await container.sessionService.create(updated);
    return Response.json(container.sessionService.toPublic(updated), {
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
