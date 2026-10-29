import { Badge, Button, buttonClassName } from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import type { NotificationInboxItem } from '../models/notificationInboxItem';
import { notificationDestination } from '../notificationDestination';

export function NotificationRecord({
  item,
  busy,
  onRead,
  onArchive,
}: {
  item: NotificationInboxItem;
  busy: boolean;
  onRead: (item: NotificationInboxItem) => void;
  onArchive: (item: NotificationInboxItem) => void;
}) {
  const { confirmNavigation } = useNavigationGuard();
  const href = notificationDestination(item.destination);
  const instant = item.publishedAt ?? item.createdAt;
  return (
    <article
      className={`grid min-w-0 gap-4 p-4 sm:p-6 ${item.readAt ? '' : 'bg-brand-primary'}`}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap gap-2">
          <Badge intent="neutral">{copy.categories[item.category]}</Badge>
          {!item.readAt && (
            <Badge intent="brand" dot>
              {copy.readStatuses.unread}
            </Badge>
          )}
        </div>
        <time dateTime={instant} className="text-xs text-tertiary">
          {new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(instant))}
        </time>
      </div>
      <div className="grid min-w-0 gap-2">
        <h2 className="m-0 text-lg font-semibold text-primary wrap-anywhere">
          {item.title}
        </h2>
        <p className="m-0 whitespace-pre-wrap text-sm text-secondary wrap-anywhere">
          {item.body}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {href && (
          <NavigationLink
            href={href}
            beforeNavigate={confirmNavigation}
            className={buttonClassName('secondary')}
          >
            {copy.openAction}
          </NavigationLink>
        )}
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => onRead(item)}
        >
          {item.readAt ? copy.markUnreadAction : copy.markReadAction}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={() => onArchive(item)}>
          {copy.archiveAction}
        </Button>
      </div>
    </article>
  );
}
