import 'server-only';
import { z } from 'zod';
import { environment } from '@/config/environment';
import { AuthError, ApiError } from '@/errors/domainErrors';
import { strings, gentlePathPortalStrings as portalCopy } from '@/strings';
import { PlatformAvailabilityTransportSchema } from '@/modules/portal/models/platformAvailabilityTransport';
import type { SignupInput } from '@/models/auth';
import type { FirebaseAuthSession } from './models/firebaseAuthSession';
import type { FirebaseAuthServiceInterface } from './firebaseAuthServiceInterface';
import { AuthResponseSchema } from './models/authResponse';
import { RefreshResponseSchema } from './models/refreshResponse';
export class FirebaseAuthService implements FirebaseAuthServiceInterface {
  async signIn(email: string, password: string) {
    return this.authenticate('accounts:signInWithPassword', {
      email,
      password,
      returnSecureToken: true,
    });
  }
  async signUp(input: SignupInput) {
    const availability = await fetch(`${environment.apiUrl}/platform/status`, {
      headers: {
        'app-version': environment.appVersion,
        accept: 'application/json',
      },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(15000),
    });
    if (!availability.ok)
      throw new ApiError(strings.errors.unavailable, availability.status);
    const settings = PlatformAvailabilityTransportSchema.parse(
      await availability.json(),
    );
    if (!settings.registrations_enabled)
      throw new AuthError(portalCopy.system.registrationPaused, 403);
    return this.authenticate('accounts:signUp', {
      email: input.email,
      password: input.password,
      displayName: `${input.firstName} ${input.lastName}`,
      returnSecureToken: true,
    });
  }
  private async authenticate(
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<FirebaseAuthSession> {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${encodeURIComponent(environment.firebaseApiKey)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      },
    );
    const result = AuthResponseSchema.parse(await this.parse(response));
    return {
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      externalId: result.localId,
      email: result.email,
      expiresAt: Date.now() + result.expiresIn * 1000,
    };
  }
  async refresh(session: FirebaseAuthSession): Promise<FirebaseAuthSession> {
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(environment.firebaseApiKey)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: session.refreshToken,
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      },
    );
    const result = RefreshResponseSchema.parse(await this.parse(response));
    return {
      ...session,
      idToken: result.id_token,
      refreshToken: result.refresh_token,
      externalId: result.user_id,
      expiresAt: Date.now() + result.expires_in * 1000,
    };
  }
  private async parse(response: Response): Promise<unknown> {
    const payload = await response.json();
    if (response.ok) return payload;
    if (response.status >= 500)
      throw new ApiError(strings.errors.unavailable, 503);
    const code = z
      .object({ error: z.object({ message: z.string() }) })
      .safeParse(payload);
    const key = code.success ? code.data.error.message.split(' : ')[0] : '';
    const messages: Record<string, string> = {
      EMAIL_EXISTS: strings.auth.emailExists,
      INVALID_EMAIL: strings.auth.invalidEmail,
      USER_DISABLED: strings.auth.disabled,
      TOO_MANY_ATTEMPTS_TRY_LATER: strings.auth.tooMany,
      WEAK_PASSWORD: strings.auth.password,
    };
    throw new AuthError(
      messages[key] || strings.auth.invalidCredentials,
      key === 'EMAIL_EXISTS' ? 409 : 401,
    );
  }
}
