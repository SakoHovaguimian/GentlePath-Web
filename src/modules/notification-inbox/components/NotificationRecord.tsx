import {
  Card,
  IconButton,
  IconTile,
  UiIcon,
  type IconName,
} from '@/components/ui';
import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathNotificationInboxStrings as copy } from '@/strings';
import type { NotificationCategory } from '../models/notificationCategory';
import type { NotificationInboxItem } from '../models/notificationInboxItem';
import { notificationDestination } from '../notificationDestination';
import styles from '../NotificationInbox.module.css';

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
    <Card className={styles.record} data-unread={!item.readAt || undefined}>
      <IconTile
        className={`${categoryTones[item.category]} ${styles.categoryIcon}`}
      >
        <UiIcon name={categoryIcons[item.category]} className="size-5" />
      </IconTile>
      <article className={styles.content} aria-labelledby={headingId}>
        <div className={styles.category}>
          <span>{copy.categories[item.category]}</span>
          {!item.readAt && (
            <span className={styles.unread}>
              <span aria-hidden="true" />
              {copy.readStatuses.unread}
            </span>
          )}
        </div>
        <h2 id={headingId}>
          {href ? (
            <NavigationLink
              href={href}
              beforeNavigate={confirmNavigation}
              className={styles.open}
            >
              {item.title}
            </NavigationLink>
          ) : (
            item.title
          )}
        </h2>
        <p>{item.body}</p>
      </article>
      <div className={styles.aside}>
        <time dateTime={instant}>
          {new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(instant))}
        </time>
        <div className={styles.controls}>
          <IconButton
            variant="ghost"
            label={copy.readItemLabel(item.title, Boolean(item.readAt))}
            disabled={busy}
            onClick={() => onRead(item)}
          >
            <UiIcon name={item.readAt ? 'mail' : 'check'} className="size-4" />
          </IconButton>
          <IconButton
            variant="destructive"
            label={copy.archiveItemLabel(item.title)}
            disabled={busy}
            onClick={() => onArchive(item)}
          >
            <UiIcon name="box" className="size-4" />
          </IconButton>
        </div>
      </div>
    </Card>
  );
}
