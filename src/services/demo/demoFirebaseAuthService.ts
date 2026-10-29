import 'server-only';
import { AuthError, OwnershipError } from '@/errors/domainErrors';
import { strings, gentlePathDemoStrings } from '@/strings';
import { getDemoPortalState } from './demoPortalState';
import type { SignupInput } from '@/models/auth';
import type { FirebaseAuthSession } from '@/services/auth/models/firebaseAuthSession';
import type { FirebaseAuthServiceInterface } from '@/services/auth/firebaseAuthServiceInterface';
import { getDemoState, passwordMatches, passwordRecord } from './demoState';
export class DemoFirebaseAuthService implements FirebaseAuthServiceInterface {
  async signIn(email: string, password: string): Promise<FirebaseAuthSession> {
    const state = getDemoState();
    const user = state.users.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    );
    const credential = user && state.credentials.get(user.external_id);
    if (
      !user ||
      user.deleted ||
      user.disabled ||
      !credential ||
      !passwordMatches(password, credential)
    )
      throw new AuthError(strings.auth.invalidCredentials);
    return this.session(user.external_id, user.email);
  }
  async signUp(input: SignupInput): Promise<FirebaseAuthSession> {
    if (!getDemoPortalState().settings.registrationsEnabled)
      throw new OwnershipError(gentlePathDemoStrings.registrationPaused);
    const state = getDemoState();
    const email = input.email.trim().toLowerCase();
    if (state.users.some((user) => user.email.toLowerCase() === email))
      throw new AuthError(strings.auth.emailExists, 409);
    const now = new Date().toISOString();
    const user = {
      id: crypto.randomUUID(),
      external_id: crypto.randomUUID(),
      first_name: input.firstName,
      last_name: input.lastName,
      email,
      role: 'user' as const,
      disabled: false,
      phone_number: null,
      date_of_birth: null,
      created_at: now,
      updated_at: now,
      deleted: false,
    };
    state.users.push(user);
    state.credentials.set(user.external_id, passwordRecord(input.password));
    return this.session(user.external_id, email);
  }
  async refresh(session: FirebaseAuthSession): Promise<FirebaseAuthSession> {
    const state = getDemoState();
    if (
      state.refreshTokens.get(session.refreshToken) !== session.externalId ||
      !state.users.some(
        (user) =>
          user.external_id === session.externalId &&
          !user.deleted &&
          !user.disabled,
      )
    )
      throw new AuthError(strings.errors.sessionExpired);
    state.refreshTokens.delete(session.refreshToken);
    return this.session(session.externalId, session.email);
  }
  private session(externalId: string, email: string): FirebaseAuthSession {
    const refreshToken = crypto.randomUUID();
    getDemoState().refreshTokens.set(refreshToken, externalId);
    return {
      idToken: crypto.randomUUID(),
      refreshToken,
      externalId,
      email,
      expiresAt: Date.now() + 3600000,
    };
  }
}
