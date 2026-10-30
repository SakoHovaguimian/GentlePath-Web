'use client';
import { UiIcon } from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import { useRealtime } from '@/services/realtime/RealtimeProvider';
import { useNotificationCounts } from '../hooks';

export function NotificationInboxLink() {
  const counts = useNotificationCounts();
  const { confirmNavigation } = useNavigationGuard();
  const unread = counts.isError ? undefined : counts.data?.unreadCount;
  const needsDecision = useRealtime().notificationStatus === 'undecided';
  const badgeCount =
    unread === undefined
      ? needsDecision
        ? 1
        : undefined
      : unread + (needsDecision ? 1 : 0);
  return (
    <NavigationLink
      href="/notifications"
      beforeNavigate={confirmNavigation}
      aria-label={
        needsDecision
          ? copy.inboxSetupLabel(unread)
          : counts.isError
            ? copy.inboxUnknownLabel
            : unread === undefined
              ? copy.countLoadingLabel
              : copy.inboxLinkLabel(unread)
      }
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-secondary bg-primary text-secondary transition-colors hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <UiIcon name="bell" className="size-5" />
      {badgeCount !== undefined && badgeCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-solid px-1 text-xs font-semibold text-(--color-text-primary_on-brand)"
        >
          {badgeCount > 99
            ? copy.countLimit
            : badgeCount.toLocaleString('en-US')}
        </span>
      )}
    </NavigationLink>
  );
}
