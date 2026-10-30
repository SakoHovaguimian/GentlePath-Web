import 'server-only';
import { getDemoState } from '@/services/demo/demoState';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { getDemoCommunityState } from '@/modules/community/demo/communityState';
import { journalEntryLocation } from '@/modules/portal/journalEntryLocation';
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
  const portal = getDemoPortalState();
  const post = getDemoCommunityState().posts.find(
    (item) => !item.deleted && !item.hidden,
  );
  const resource = portal.resources[0];
  if (!globalInbox.gentlePathNotificationInboxState) {
    const now = Date.now();
    const notifications = getDemoState().users.flatMap((user) => {
      const journal = portal.journals.find((entry) => entry.userId === user.id);
      const templates = [
        {
          category: 'ACTIVITY' as const,
          title: copy.demo.activityTitle,
          body: copy.demo.activityBody,
          destination: journal ? journalEntryLocation(journal.id) : null,
        },
        {
          category: 'MENTION' as const,
          title: copy.demo.mentionTitle,
          body: copy.demo.mentionBody,
          destination: post
            ? `/community/${encodeURIComponent(post.id)}`
            : null,
        },
        {
          category: 'TAG' as const,
          title: copy.demo.tagTitle,
          body: copy.demo.tagBody,
          destination: resource
            ? `/resources/${encodeURIComponent(resource.id)}`
            : null,
        },
        {
          category: 'PRODUCT_UPDATE' as const,
          title: copy.demo.updateTitle,
          body: copy.demo.updateBody,
          destination: '/dashboard',
        },
      ];
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
  // Upgrade section-only demo links retained by a running development process.
  // Concrete links stay attached to their original record even after deletion.
  for (const item of globalInbox.gentlePathNotificationInboxState
    .notifications) {
    if (item.destination === '/journal' && item.category === 'ACTIVITY') {
      const journal = portal.journals.find(
        (entry) => entry.userId === item.userId,
      );
      item.destination = journal ? journalEntryLocation(journal.id) : null;
    } else if (item.destination === '/community' && item.category === 'MENTION')
      item.destination = post
        ? `/community/${encodeURIComponent(post.id)}`
        : null;
    else if (item.destination === '/resources' && item.category === 'TAG')
      item.destination = resource
        ? `/resources/${encodeURIComponent(resource.id)}`
        : null;
  }
  return globalInbox.gentlePathNotificationInboxState;
}
export function resetDemoNotificationInboxState() {
  globalInbox.gentlePathNotificationInboxState = undefined;
}
