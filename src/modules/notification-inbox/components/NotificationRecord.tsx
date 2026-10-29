import {
  Badge,
  Button,
  Card,
  IconTile,
  UiIcon,
  buttonClassName,
  type IconName,
} from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import type { NotificationCategory } from '../models/notificationCategory';
import type { NotificationInboxItem } from '../models/notificationInboxItem';
import { notificationDestination } from '../notificationDestination';

const categoryIcons: Record<NotificationCategory, IconName> = {
  ACTIVITY: 'leaf',
  MENTION: 'chat',
  TAG: 'tag',
  PRODUCT_UPDATE: 'sparkles',
};
const categoryTones: Record<NotificationCategory, string> = {
  ACTIVITY: 'bg-(--gp-sage) text-primary',
  MENTION: 'bg-(--gp-lilac) text-primary',
  TAG: 'bg-(--gp-sunlight) text-primary',
  PRODUCT_UPDATE: 'bg-(--gp-clay) text-primary',
};

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
  const headingId = `notification-${item.id}`;
  return (
    <Card className="relative overflow-hidden p-5 sm:p-6">
      {!item.readAt && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-brand-solid"
        />
      )}
      <article
        aria-labelledby={headingId}
        className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3"
      >
        <IconTile className={`${categoryTones[item.category]} sm:row-span-2`}>
          <UiIcon name={categoryIcons[item.category]} className="size-5" />
        </IconTile>
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-5 gap-y-2 sm:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm font-medium text-secondary">
              {copy.categories[item.category]}
            </span>
            {!item.readAt ? (
              <Badge intent="brand" dot>
                {copy.readStatuses.unread}
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-tertiary">
                <UiIcon name="check" className="size-4" />
                {copy.readStatuses.read}
              </span>
            )}
          </div>
          <time dateTime={instant} className="text-xs text-tertiary">
            {new Intl.DateTimeFormat('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(instant))}
          </time>
        </div>
        <div className="col-span-2 grid min-w-0 gap-4 sm:col-span-1 sm:col-start-2">
          <div className="grid min-w-0 gap-2">
            <h2
              id={headingId}
              className="m-0 font-display text-xl font-normal text-primary wrap-anywhere sm:text-2xl"
            >
              {item.title}
            </h2>
            <p className="m-0 max-w-3xl whitespace-pre-wrap text-sm leading-relaxed text-secondary wrap-anywhere">
              {item.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {href && (
              <NavigationLink
                href={href}
                beforeNavigate={confirmNavigation}
                className={buttonClassName('secondary', 'px-4')}
              >
                {copy.openAction}
                <UiIcon name="arrowRight" className="size-4" />
              </NavigationLink>
            )}
            <Button
              variant="ghost"
              className="px-3"
              disabled={busy}
              onClick={() => onRead(item)}
            >
              <UiIcon
                name={item.readAt ? 'mail' : 'check'}
                className="size-4"
              />
              {item.readAt ? copy.markUnreadAction : copy.markReadAction}
            </Button>
            <Button
              variant="destructive"
              className="px-3"
              disabled={busy}
              onClick={() => onArchive(item)}
            >
              <UiIcon name="box" className="size-4" />
              {copy.archiveAction}
            </Button>
          </div>
        </div>
      </article>
    </Card>
  );
}
