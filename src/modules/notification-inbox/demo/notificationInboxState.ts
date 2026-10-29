import 'server-only';
import { getDemoState } from '@/services/demo/demoState';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import { NotificationCategorySchema } from '../models/notificationCategory';
import { NotificationChannelSchema } from '../models/notificationChannel';
import type { NotificationPreference } from '../models/notificationPreference';
import type { DemoNotificationInboxState } from './models/demoNotificationInboxState';
import type { DemoInboxNotification } from './models/demoInboxNotification';

const globalInbox = globalThis as typeof globalThis & {
  gentlePathNotificationInboxState?: DemoNotificationInboxState;
};
export function defaultNotificationPreferences(): NotificationPreference[] {
  return NotificationCategorySchema.options.flatMap((category) =>
    NotificationChannelSchema.options.map((channel) => ({
      category,
      channel,
      enabled: channel !== 'EMAIL',
    })),
  );
}
export function getDemoNotificationInboxState(): DemoNotificationInboxState {
  if (!globalInbox.gentlePathNotificationInboxState) {
    const now = Date.now();
    const templates = [
      {
        category: 'ACTIVITY' as const,
        title: copy.demo.activityTitle,
        body: copy.demo.activityBody,
        destination: '/journal',
      },
      {
        category: 'MENTION' as const,
        title: copy.demo.mentionTitle,
        body: copy.demo.mentionBody,
        destination: '/community',
      },
      {
        category: 'TAG' as const,
        title: copy.demo.tagTitle,
        body: copy.demo.tagBody,
        destination: '/resources',
      },
      {
        category: 'PRODUCT_UPDATE' as const,
        title: copy.demo.updateTitle,
        body: copy.demo.updateBody,
        destination: '/dashboard',
      },
    ];
    const notifications = getDemoState().users.flatMap((user) => {
      const visible: DemoInboxNotification[] = templates.map(
        (template, index) => {
          const instant = new Date(
            now - (index + 1) * 86_400_000,
          ).toISOString();
          return {
            ...template,
            id: crypto.randomUUID(),
            userId: user.id,
            createdAt: instant,
            publishedAt: instant,
            readAt: index === 2 ? instant : null,
            deleted: false,
            status: 'PUBLISHED',
            inAppEnabled: true,
            expiresAt: null,
          };
        },
      );
      const base = visible[0];
      return [
        ...visible,
        {
          ...base,
          id: crypto.randomUUID(),
          title: copy.demo.archiveTitle,
          body: copy.demo.archiveBody,
          deleted: true,
        },
        {
          ...base,
          id: crypto.randomUUID(),
          title: copy.demo.scheduledTitle,
          body: copy.demo.scheduledBody,
          status: 'SCHEDULED' as const,
          publishedAt: null,
        },
        {
          ...base,
          id: crypto.randomUUID(),
          title: copy.demo.expiredTitle,
          body: copy.demo.expiredBody,
          expiresAt: new Date(now - 1000).toISOString(),
        },
      ];
    });
    globalInbox.gentlePathNotificationInboxState = {
      notifications,
      preferences: new Map(),
      settings: new Map(),
    };
  }
  return globalInbox.gentlePathNotificationInboxState;
}
export function resetDemoNotificationInboxState() {
  globalInbox.gentlePathNotificationInboxState = undefined;
}
