import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { users, featureRequests } from './demoFixtures';
import type { DemoState } from './models/demoState';
import { strings, gentlePathDemoStrings } from '@/strings';
export function passwordRecord(password: string) {
  const salt = randomBytes(16).toString('hex');
  return { salt, hash: scryptSync(password, salt, 32).toString('hex') };
}
export function passwordMatches(
  password: string,
  record: { salt: string; hash: string },
) {
  return timingSafeEqual(
    Buffer.from(record.hash, 'hex'),
    scryptSync(password, record.salt, 32),
  );
}
const globalDemo = globalThis as typeof globalThis & {
  portalDemoState?: DemoState;
};
export function getDemoState(): DemoState {
  if (!globalDemo.portalDemoState) {
    globalDemo.portalDemoState = {
      users: structuredClone(users),
      featureRequests: structuredClone(featureRequests),
      credentials: new Map(
        users.map((user) => [
          user.external_id,
          passwordRecord(gentlePathDemoStrings.seedPassword),
        ]),
      ),
      refreshTokens: new Map(),
      messages: [
        {
          id: '77777777-7777-4777-8777-777777777777',
          userId: users[0].id,
          author: strings.chat.author,
          message: strings.chat.seed,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }
  return globalDemo.portalDemoState;
}

export function resetDemoState() {
  globalDemo.portalDemoState = undefined;
  return getDemoState();
}
