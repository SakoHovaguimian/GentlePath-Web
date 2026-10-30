import 'server-only';
import { cookies } from 'next/headers';
import { createHash } from 'node:crypto';
import type { AppSession } from '@/models/auth';
import type { ServerSession } from './models/serverSession';
import type { FirebaseAuthServiceInterface } from '@/services/auth/firebaseAuthServiceInterface';
import type { FirebaseAuthSession } from '@/services/auth/models/firebaseAuthSession';
import { AuthError } from '@/errors/domainErrors';
import { strings } from '@/strings';
import { getDemoState } from '@/services/demo/demoState';
import {
  decodeSession,
  encodeSession,
  sessionCookieName,
  sessionDuration,
} from './sessionCodec';
export class SessionService {
  private readonly refreshes = new Map<string, Promise<FirebaseAuthSession>>();
  constructor(
    private readonly auth: FirebaseAuthServiceInterface,
    private readonly demoMode = false,
  ) {}
  async read(): Promise<ServerSession | null> {
    const token = (await cookies()).get(sessionCookieName)?.value;
    const session = token ? await decodeSession(token, this.demoMode) : null;
    if (session?.demo) {
      const user = getDemoState().users.find(
        (candidate) =>
          candidate.id === session.user.id &&
          candidate.external_id === session.auth.externalId &&
          !candidate.deleted &&
          !candidate.disabled,
      );
      if (!user) return null;
      session.user = {
        id: user.id,
        externalId: user.external_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role ?? 'user',
      };
    }
    return session;
  }
  async publicSession(): Promise<AppSession | null> {
    const session = await this.read();
    return session && session.auth.expiresAt > Date.now()
      ? this.toPublic(session)
      : null;
  }
  toPublic(session: ServerSession): AppSession {
    return {
      user: session.user,
      expiresAt: new Date(session.auth.expiresAt).toISOString(),
    };
  }
  async create(session: ServerSession) {
    const token = await encodeSession(session);
    if (Buffer.byteLength(token) > 3800)
      throw new AuthError(strings.auth.sessionTooLarge, 500);
    (await cookies()).set(sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: sessionDuration,
      priority: 'high',
    });
  }
  async delete() {
    (await cookies()).delete(sessionCookieName);
  }
  // Only call from Route Handlers or Server Actions: refresh writes Set-Cookie.
  async valid(): Promise<ServerSession | null> {
    const session = await this.read();
    return session && session.auth.expiresAt - Date.now() <= 300000
      ? this.refresh(session)
      : session;
  }
  async refresh(session: ServerSession): Promise<ServerSession | null> {
    const key = createHash('sha256')
      .update(session.auth.refreshToken)
      .digest('hex');
    let pending = this.refreshes.get(key);
    if (!pending) {
      pending = this.auth.refresh(session.auth);
      this.refreshes.set(key, pending);
      void pending
        .finally(() => {
          setTimeout(() => this.refreshes.delete(key), 5000).unref();
        })
        .catch(() => undefined);
    }
    try {
      const updated = { ...session, auth: await pending };
      await this.create(updated);
      return updated;
    } catch (error) {
      if (error instanceof AuthError && error.status === 401) {
        await this.delete();
        return null;
      }
      throw error;
    }
  }
}
