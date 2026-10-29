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
import { FamilyTipInputSchema, type FamilyTip } from '../models/familyTip';
import type { MilestoneGuidance } from '../models/milestoneGuidance';
import { useSaveFamilyTip } from '../hooks';
const emptyMilestoneChoice = '';
interface FamilyTipEditorProps {
  tip?: FamilyTip;
  milestones: MilestoneGuidance[];
  initialMilestoneId?: string;
  onClose: () => void;
}
export function FamilyTipEditor({
  tip,
  milestones,
  initialMilestoneId,
  onClose,
}: FamilyTipEditorProps) {
  const [milestoneId, setMilestoneId] = useState(
    tip?.milestone_id ?? initialMilestoneId ?? '',
  );
  const [message, setMessage] = useState(tip?.message ?? '');
  const [validation, setValidation] = useState<Record<string, string>>({});
  const dirty = useRef(false),
    busy = useRef(false);
  const leave = useUnsavedFormGuard(dirty, busy);
  const save = useSaveFamilyTip();
  const { showToast } = usePresentationService();
  const dismiss = () => {
    void leave().then((allowed) => {
      if (allowed) onClose();
    });
  };
  const change = (action: () => void) => {
    dirty.current = true;
    setValidation({});
    action();
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = FamilyTipInputSchema.safeParse({
      milestone_id: milestoneId,
      message,
    });
    if (!parsed.success) {
      setValidation(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      const key = String(parsed.error.issues[0].path[0]);
      if (key === 'milestone_id')
        event.currentTarget
          .querySelector<HTMLElement>('.ui-select-trigger')
          ?.focus();
      else
        event.currentTarget
          .querySelector<HTMLElement>('[name="message"]')
          ?.focus();
      return;
    }
    busy.current = true;
    try {
      await save.mutateAsync({ input: parsed.data, id: tip?.id });
      dirty.current = false;
      void showToast({ title: copy.tipSaved, intent: 'success' });
      onClose();
    } catch {
      /* Preserve message and chosen milestone. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Modal
      open
      title={tip ? copy.editTip : copy.submitTip}
      description={copy.tipFormDescription}
      onDismiss={dismiss}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <div className="grid gap-2">
          <Field labelText={copy.milestoneLabel}>
            <Select
              name="milestone_id"
              value={milestoneId}
              disabled={Boolean(tip) || save.isPending}
              aria-invalid={Boolean(validation.milestone_id)}
              aria-describedby={
                validation.milestone_id
                  ? 'tip-validation'
                  : tip
                    ? 'tip-milestone-locked'
                    : undefined
              }
              onValueChange={(value) => change(() => setMilestoneId(value))}
            >
              <option value={emptyMilestoneChoice}>
                {copy.milestoneChoice}
              </option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.milestone}
                </option>
              ))}
            </Select>
          </Field>
          {tip && (
            <p id="tip-milestone-locked" className="m-0 text-xs text-tertiary">
              {copy.milestoneLocked}
            </p>
          )}
        </div>
        <Field labelText={copy.messageLabel}>
          <TextArea
            name="message"
            value={message}
            rows={8}
            maxLength={20000}
            disabled={save.isPending}
            aria-invalid={Boolean(validation.message)}
            aria-describedby={validation.message ? 'tip-validation' : undefined}
            onChange={(event) => change(() => setMessage(event.target.value))}
          />
        </Field>
        {tip && (
          <p className="m-0 text-sm text-secondary">{copy.tipEditHint}</p>
        )}
        {Object.keys(validation).length > 0 && (
          <p
            role="alert"
            id="tip-validation"
            className="m-0 text-sm text-error-primary"
          >
            {Object.values(validation).join(' ')}
          </p>
        )}
        <MutationError error={save.error} />
        <FormActions variant="inline" sticky={false}>
          <Button
            variant="secondary"
            onClick={dismiss}
            disabled={save.isPending}
          >
            {copy.cancel}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {tip ? copy.saveTip : copy.submitTip}
          </Button>
        </FormActions>
      </form>
    </Modal>
  );
}
