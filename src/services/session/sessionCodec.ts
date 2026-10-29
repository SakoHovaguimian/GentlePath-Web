import 'server-only';
import { createHash } from 'node:crypto';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { environment } from '@/config/environment';
import { strings } from '@/strings';
import {
  ServerSessionSchema,
  type ServerSession,
} from './models/serverSession';
export const sessionCookieName = 'portal_session';
export const sessionDuration = 60 * 60 * 24 * 30;
const key = (demoMode: boolean) => {
  const configured = process.env.SESSION_SECRET;
  if (
    !demoMode &&
    (!configured ||
      configured.length < 32 ||
      configured.includes('replace-with'))
  )
    throw new Error(strings.environment.secret);
  return createHash('sha256')
    .update(configured || 'portal-demo-only-local-session-secret')
    .digest();
};
export async function encodeSession(session: ServerSession) {
  return new EncryptJWT({ session })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${sessionDuration}s`)
    .encrypt(key(session.demo));
}
export async function decodeSession(
  token: string,
  demoMode = environment.demoMode,
): Promise<ServerSession | null> {
  try {
    const { payload } = await jwtDecrypt(token, key(demoMode), {
      keyManagementAlgorithms: ['dir'],
      contentEncryptionAlgorithms: ['A256GCM'],
    });
    const session = ServerSessionSchema.parse(payload.session);
    return session.demo === demoMode ? session : null;
  } catch {
    return null;
  }
}
