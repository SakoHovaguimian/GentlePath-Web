import { Badge, Card, CardOpenButton, IconMenu } from '@/components/ui';
import type { IconMenuItem } from '@/components/ui/models/iconMenuItem';
import { SavedContentButton } from '@/modules/engagement/components/SavedContentButton';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { FamilyTip } from '../models/familyTip';
import { formatMilestoneDate } from '../formatMilestoneDate';

export function FamilyTipCard({
  tip,
  milestone,
  owned,
  busy,
  onRead,
  onEdit,
  onDelete,
}: {
  tip: FamilyTip;
  milestone: string;
  owned: boolean;
  busy: boolean;
  onRead: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const actions: IconMenuItem<string>[] = [
    { id: 'read', icon: 'info', label: copy.readTip },
    ...(owned
      ? [
          {
            id: 'edit',
            icon: 'file' as const,
            label: copy.editTip,
            disabled: busy,
          },
          {
            id: 'delete',
            icon: 'trash' as const,
            label: copy.deleteTip,
            variant: 'destructive' as const,
            disabled: busy,
          },
        ]
      : []),
  ];
  function action(id: string) {
    if (id === 'read') onRead();
    if (id === 'edit' && owned && !busy) onEdit();
    if (id === 'delete' && owned && !busy) onDelete();
  }
  return (
    <Card className="gp-milestone-tip-card">
      <CardOpenButton
        type="button"
        className="gp-milestone-tip-card__open"
        aria-label={copy.openTip(milestone)}
        onClick={onRead}
      />
      <div className="flex items-start justify-between gap-3">
        <Badge
          dot
          intent={
            tip.approval_status === 'APPROVED'
              ? 'success'
              : tip.approval_status === 'REJECTED'
                ? 'warning'
                : 'neutral'
          }
        >
          {copy.statuses[tip.approval_status]}
        </Badge>
        <div className="gp-milestone-tip-card__control">
          {tip.approval_status === 'APPROVED' ? (
            <SavedContentButton
              contentType="TIP"
              contentId={tip.id}
              variant="menu"
              menuLabel={copy.tipActions}
              menuItems={actions}
              onMenuAction={action}
            />
          ) : (
            <IconMenu
              label={copy.tipActions}
              items={actions}
              onAction={action}
            />
          )}
        </div>
      </div>
      <h2 className="m-0 font-display text-xl font-normal text-primary wrap-anywhere">
        {milestone}
      </h2>
      <p className="m-0 line-clamp-5 flex-1 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
        {tip.message}
      </p>
      {tip.review?.review_notes && (
        <p className="m-0 line-clamp-3 border-l-2 border-secondary pl-3 text-sm text-secondary wrap-anywhere">
          {tip.review.review_notes}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-secondary pt-4">
        <div className="grid gap-1 text-xs text-tertiary">
          <span>
            {tip.author
              ? copy.authorName(tip.author.first_name, tip.author.last_name)
              : copy.unavailableAuthor}
          </span>
          <time dateTime={tip.created_at}>
            {formatMilestoneDate(tip.created_at)}
          </time>
        </div>
        {tip.approval_status === 'APPROVED' && (
          <div className="gp-milestone-tip-card__control ms-auto">
            <SavedContentButton contentType="TIP" contentId={tip.id} />
          </div>
        )}
      </div>
    </Card>
  );
}
