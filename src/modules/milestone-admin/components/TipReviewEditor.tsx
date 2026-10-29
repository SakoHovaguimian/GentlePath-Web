'use client';
import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Field,
  FormActions,
  Modal,
  Select,
  TextArea,
} from '@/components/ui';
import { MutationError } from '@/modules/portal/components/MutationError';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { FamilyTip } from '../models/familyTip';
import { TipReviewInputSchema } from '../models/tipReview';
import { useReviewFamilyTip } from '../hooks';
import { TipReviewRecord } from './TipReviewRecord';
const approvedDecision = 'APPROVED';
const rejectedDecision = 'REJECTED';
interface TipReviewEditorProps {
  tip: FamilyTip;
  milestone: string;
  onClose: () => void;
}
export function TipReviewEditor({
  tip,
  milestone,
  onClose,
}: TipReviewEditorProps) {
  const [decision, setDecision] = useState(
    tip.approval_status === 'APPROVED' ? 'REJECTED' : 'APPROVED',
  );
  const [notes, setNotes] = useState(tip.review?.review_notes ?? '');
  const [validation, setValidation] = useState('');
  const [confirming, setConfirming] = useState(false);
  const dirty = useRef(false),
    busy = useRef(false);
  const leave = useUnsavedFormGuard(dirty, busy);
  const mutation = useReviewFamilyTip();
  const { showAlert, showToast } = usePresentationService();
  const dismiss = () => {
    void leave().then((allowed) => {
      if (allowed) onClose();
    });
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = TipReviewInputSchema.safeParse({
      approval_status: decision,
      review_notes: notes.trim() || null,
    });
    if (!parsed.success) {
      setValidation(
        parsed.error.issues.map((issue) => issue.message).join(' '),
      );
      event.currentTarget
        .querySelector<HTMLElement>('[name="review_notes"]')
        ?.focus();
      return;
    }
    busy.current = true;
    setConfirming(true);
    try {
      if (
        tip.approval_status !== 'PENDING' &&
        !(await showAlert({
          title: copy.reverseTitle,
          description: copy.reverseDescription,
          tone: decision === 'REJECTED' ? 'danger' : 'info',
          confirmLabel: copy.confirmReview,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await mutation.mutateAsync({ id: tip.id, input: parsed.data });
      dirty.current = false;
      void showToast({ title: copy.reviewSaved, intent: 'success' });
      onClose();
    } catch {
      /* Keep the decision and note for recovery. */
    } finally {
      busy.current = false;
      setConfirming(false);
    }
  }
  return (
    <Modal
      open
      title={copy.reviewTip}
      description={copy.reviewFormDescription}
      onDismiss={dismiss}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <div className="grid gap-2">
          <p className="m-0 text-sm font-medium text-primary">{milestone}</p>
          <p className="m-0 max-h-64 overflow-auto whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
            {tip.message}
          </p>
        </div>
        <TipReviewRecord tip={tip} />
        {!tip.author && (
          <p className="m-0 text-sm text-secondary">
            {copy.unavailableAuthorHint}
          </p>
        )}
        <Field labelText={copy.decisionLabel}>
          <Select
            value={decision}
            disabled={mutation.isPending || confirming}
            onValueChange={(value) => {
              dirty.current = true;
              setDecision(value);
              setValidation('');
            }}
          >
            <option
              value={approvedDecision}
              disabled={tip.approval_status === 'APPROVED'}
            >
              {copy.statuses.APPROVED}
            </option>
            <option
              value={rejectedDecision}
              disabled={tip.approval_status === 'REJECTED'}
            >
              {copy.statuses.REJECTED}
            </option>
          </Select>
        </Field>
        <div className="grid gap-2">
          <Field labelText={copy.reviewNotesLabel}>
            <TextArea
              name="review_notes"
              value={notes}
              rows={5}
              maxLength={10000}
              disabled={mutation.isPending || confirming}
              aria-invalid={Boolean(validation)}
              aria-describedby={
                validation ? 'review-validation' : 'review-notes-hint'
              }
              onChange={(event) => {
                dirty.current = true;
                setNotes(event.target.value);
                setValidation('');
              }}
            />
          </Field>
          <p id="review-notes-hint" className="m-0 text-xs text-tertiary">
            {copy.reviewNotesHint}
          </p>
        </div>
        {validation && (
          <p
            id="review-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {validation}
          </p>
        )}
        <MutationError error={mutation.error} />
        <FormActions variant="inline" sticky={false}>
          <Button
            variant="secondary"
            onClick={dismiss}
            disabled={mutation.isPending || confirming}
          >
            {copy.cancel}
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={confirming && !mutation.isPending}
          >
            {copy.saveReview}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
