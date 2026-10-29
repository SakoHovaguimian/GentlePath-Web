import 'server-only';
import { users as seedAccounts } from '@/services/demo/demoFixtures';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import type { DemoAccountToolsState } from './models/demoAccountToolsState';
import { AccountDeviceTypeSchema } from '../models/accountDevice';

const globalAccountTools = globalThis as typeof globalThis & {
  gentlePathAccountToolsState?: DemoAccountToolsState;
};
export function getDemoAccountToolsState(): DemoAccountToolsState {
  if (!globalAccountTools.gentlePathAccountToolsState) {
    const accounts = seedAccounts;
    const now = new Date().toISOString();
    const before = new Date(Date.now() - 86400000).toISOString();
    const acceptedId = crypto.randomUUID();
    const failedId = crypto.randomUUID();
    globalAccountTools.gentlePathAccountToolsState = {
      devices: accounts.flatMap((user) => [
        {
          id: crypto.randomUUID(),
          userId: user.id,
          deviceType: AccountDeviceTypeSchema.enum.Web,
          createdAt: before,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          userId: user.id,
          deviceType: 'iOS',
          createdAt: before,
          updatedAt: before,
        },
      ]),
      deliveries: [
        {
          id: acceptedId,
          notificationId: crypto.randomUUID(),
          channel: 'EMAIL',
          status: 'ACCEPTED',
          attemptCount: 1,
          nextAttemptAt: null,
          acceptedAt: now,
          error: null,
          skipReason: null,
          createdAt: before,
        },
        {
          id: failedId,
          notificationId: crypto.randomUUID(),
          channel: 'PUSH',
          status: 'FAILED',
          attemptCount: 1,
          nextAttemptAt: null,
          acceptedAt: null,
          error: copy.demo.failedError,
          skipReason: null,
          createdAt: before,
        },
        {
          id: crypto.randomUUID(),
          notificationId: crypto.randomUUID(),
          channel: 'PUSH',
          status: 'SKIPPED',
          attemptCount: 0,
          nextAttemptAt: null,
          acceptedAt: null,
          error: null,
          skipReason: copy.demo.skippedReason,
          createdAt: before,
        },
      ],
      attempts: new Map([
        [
          acceptedId,
          [
            {
              id: crypto.randomUUID(),
              attemptNumber: 1,
              startedAt: before,
              finishedAt: now,
              outcome: 'ACCEPTED',
              retryable: false,
              error: null,
            },
          ],
        ],
        [
          failedId,
          [
            {
              id: crypto.randomUUID(),
              attemptNumber: 1,
              startedAt: before,
              finishedAt: now,
              outcome: 'FAILED',
              retryable: true,
              error: copy.demo.failedError,
            },
          ],
        ],
      ]),
      aiUsage: [
        {
          id: crypto.randomUUID(),
          userId: accounts[0]?.id ?? null,
          context: copy.demo.usageContext,
          inputTokens: 240,
          outputTokens: 88,
          totalTokens: 328,
          metadata: { ...copy.demo.usageMetadata },
          error: null,
          deleted: false,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: crypto.randomUUID(),
          userId: null,
          context: copy.demo.usageContext,
          inputTokens: 120,
          outputTokens: 40,
          totalTokens: 160,
          metadata: { ...copy.demo.usageMetadata },
          error: null,
          deleted: false,
          createdAt: before,
          updatedAt: before,
        },
      ],
    };
  }
  return globalAccountTools.gentlePathAccountToolsState;
}
export function resetDemoAccountToolsState() {
  globalAccountTools.gentlePathAccountToolsState = undefined;
}
