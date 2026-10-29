'use client';
import { UiIcon } from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import { useNotificationCounts } from '../hooks';

export function NotificationInboxLink() {
  const counts = useNotificationCounts();
  const { confirmNavigation } = useNavigationGuard();
  const unread = counts.data?.unreadCount;
  return (
    <NavigationLink
      href="/notifications"
      beforeNavigate={confirmNavigation}
      aria-label={
        counts.isError
          ? copy.inboxUnknownLabel
          : unread === undefined
            ? copy.countLoadingLabel
            : copy.inboxLinkLabel(unread)
      }
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-secondary bg-primary text-secondary transition-colors hover:bg-primary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <UiIcon name="bell" className="size-5" />
      {unread !== undefined && unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-solid px-1 text-xs font-semibold text-(--color-text-primary_on-brand)"
        >
          {unread > 99 ? copy.countLimit : unread.toLocaleString('en-US')}
        </span>
      )}
    </NavigationLink>
  );
}
