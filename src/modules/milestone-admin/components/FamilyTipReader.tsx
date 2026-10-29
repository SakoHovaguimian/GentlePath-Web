import { Button, Modal } from '@/components/ui';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { FamilyTip } from '../models/familyTip';
import { formatMilestoneDate } from '../formatMilestoneDate';
import { TipReviewRecord } from './TipReviewRecord';
interface FamilyTipReaderProps {
  tip: FamilyTip;
  milestone: string;
  onClose: () => void;
}
export function FamilyTipReader({
  tip,
  milestone,
  onClose,
}: FamilyTipReaderProps) {
  return (
    <Modal
      open
      title={copy.readTip}
      description={milestone}
      onDismiss={onClose}
    >
      <div className="grid gap-5">
        <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
          {tip.message}
        </p>
        <dl className="m-0 grid gap-3 text-xs text-tertiary">
          <div>
            <dt className="font-medium">{copy.authorLabel}</dt>
            <dd className="m-0">
              {tip.author
                ? copy.authorName(tip.author.first_name, tip.author.last_name)
                : copy.unavailableAuthor}
            </dd>
          </div>
          <div>
            <dt className="font-medium">{copy.submittedLabel}</dt>
            <dd className="m-0">
              <time dateTime={tip.created_at}>
                {formatMilestoneDate(tip.created_at)}
              </time>
            </dd>
          </div>
          <div>
            <dt className="font-medium">{copy.updatedLabel}</dt>
            <dd className="m-0">
              <time dateTime={tip.updated_at}>
                {formatMilestoneDate(tip.updated_at)}
              </time>
            </dd>
          </div>
        </dl>
        {tip.review && <TipReviewRecord tip={tip} />}
        <div className="flex justify-end border-t border-secondary pt-4">
          <Button variant="secondary" onClick={onClose}>
            {copy.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
