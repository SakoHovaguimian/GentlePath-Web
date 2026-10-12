import { strings } from '@/strings';
import { IconButton } from './IconButton';
import { UiIcon } from './UiIcon';

export function IosPushNotification({
  title,
  body,
  onDismiss,
}: {
  title: string;
  body?: string;
  onDismiss: () => void;
}) {
  const copy = strings.pushPreview;
  return (
    <div
      role="status"
      className="group relative flex items-start gap-3 rounded-3xl border border-(--ios-push-border) bg-(--ios-push-background) p-4 text-(--ios-push-text) shadow-(--ios-push-shadow) backdrop-blur-2xl font-ios-push"
    >
      <div
        aria-hidden="true"
        className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-[0.6rem] bg-(--ios-push-icon-background) text-(--ios-push-icon-foreground)"
      >
        <UiIcon name="leaf" className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-baseline justify-between gap-3">
          <span className="truncate text-xs font-semibold">
            {copy.pushAppName}
          </span>
          <span className="shrink-0 text-xs text-(--ios-push-secondary)">
            {copy.pushNow}
          </span>
        </div>
        <p className="m-0 wrap-break-word text-sm leading-snug font-semibold">
          {title}
        </p>
        {body && (
          <p className="m-0 mt-0.5 line-clamp-4 wrap-break-word text-sm leading-snug">
            {body}
          </p>
        )}
      </div>
      <IconButton
        variant="ghost"
        label={copy.dismissPush}
        onClick={onDismiss}
        className="absolute -top-2 -right-1 size-11 rounded-full bg-(--ios-push-background) opacity-100 shadow-sm"
      >
        <UiIcon name="close" className="size-4" />
      </IconButton>
    </div>
  );
}
