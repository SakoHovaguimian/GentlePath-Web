import 'server-only';
import type { RuntimeConfig } from '@/models/runtimeConfig';
import { strings } from '@/strings';
function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(strings.environment.missing(name));
  return value;
}
export const environment = {
  get demoMode() {
    return process.env.DEMO_MODE === 'true';
  },
  get sessionSecret() {
    const value = process.env.SESSION_SECRET;
    if (this.demoMode) return value || 'portal-demo-only-local-session-secret';
    if (!value || value.length < 32 || value.includes('replace-with'))
      throw new Error(strings.environment.secret);
    return value;
  },
  get apiUrl() {
    const url = new URL(required('PORTAL_API_URL'));
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error(strings.environment.invalid);
    return url.toString().replace(/\/$/, '');
  },
  get firebaseApiKey() {
    return required('FIREBASE_WEB_API_KEY');
  },
  get appVersion() {
    return process.env.APP_VERSION || '1.0.0';
  },
};
export function getRuntimeConfig(
  demoMode = environment.demoMode,
): RuntimeConfig {
  if (demoMode)
    return {
      demoMode: true,
      socketUrl: null,
      messaging: null,
      amplitudeApiKey: null,
    };
  const firebase = {
    apiKey: process.env.FIREBASE_WEB_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
  };
  const vapidKey = process.env.FIREBASE_VAPID_PUBLIC_KEY || '';
  return {
    demoMode: false,
    socketUrl: process.env.PORTAL_SOCKET_URL || null,
    messaging:
      Object.values(firebase).every(Boolean) && vapidKey
        ? { firebase, vapidKey }
        : null,
    amplitudeApiKey: process.env.AMPLITUDE_API_KEY || null,
  };
}
