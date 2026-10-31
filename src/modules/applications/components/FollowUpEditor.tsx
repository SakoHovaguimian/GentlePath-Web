import { useId, useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DomainError } from '@/errors/domainErrors';
import { Button, Field, Input, TextArea, Modal } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathApplicationStrings as copy } from '@/strings';
import {
  ApplicationFollowUpCreateSchema,
  type ApplicationFollowUp,
} from '../models/applicationFollowUp';
import { applicationQueryKeys, useApplicationMutations } from '../hooks';

export function FollowUpEditor({
  applicationId,
  followUp,
  onClose,
}: {
  applicationId: string;
  followUp?: ApplicationFollowUp;
  onClose: () => void;
}) {
  const formId = useId();
  const cache = useQueryClient();
  const [input, setInput] = useState({
    due_on: followUp?.due_on ?? '',
    notes: followUp?.notes ?? '',
  });
  const [validation, setValidation] = useState<Record<string, string>>({});
  const version = useRef(followUp?.updated_at);
  const initial = useRef(input);
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const { createFollowUp, updateFollowUp } = useApplicationMutations();
  const mutation = followUp ? updateFollowUp : createFollowUp;
  const { showToast } = usePresentationService();
  function change(key: 'due_on' | 'notes', value: string) {
    const next = { ...input, [key]: value };
    dirty.current = JSON.stringify(next) !== JSON.stringify(initial.current);
    setInput(next);
    setValidation((current) => ({ ...current, [key]: '' }));
    mutation.reset();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = ApplicationFollowUpCreateSchema.safeParse(input);
    if (!parsed.success) {
      const issues: Record<string, string> = {};
      for (const issue of parsed.error.issues)
        issues[String(issue.path[0])] = issue.message;
      setValidation(issues);
      event.currentTarget
        .querySelector<HTMLElement>(`[name="${Object.keys(issues)[0]}"]`)
        ?.focus();
      return;
    }
    busy.current = true;
    try {
      if (followUp)
        await updateFollowUp.mutateAsync({
          id: applicationId,
          followUpId: followUp.id,
          input: { ...parsed.data, expected_updated_at: version.current! },
        });
      else
        await createFollowUp.mutateAsync({
          id: applicationId,
          input: parsed.data,
        });
      dirty.current = false;
      void showToast({ title: copy.followUpSaved, intent: 'success' });
      onClose();
    } catch {
      // Keep the draft mounted on failed saves and conflicts.
    } finally {
      busy.current = false;
    }
  }
  function dismiss() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  return (
    <Modal
      open
      title={followUp ? copy.followUpEdit : copy.followUpAdd}
      onDismiss={dismiss}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            disabled={mutation.isPending}
            onClick={dismiss}
          >
            {copy.cancelAction}
          </Button>
          <Button type="submit" form={formId} loading={mutation.isPending}>
            {copy.followUpSave}
          </Button>
        </div>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={copy.dueLabel}>
          <Input
            type="date"
            name="due_on"
            value={input.due_on}
            disabled={mutation.isPending}
            onChange={(event) => change('due_on', event.target.value)}
            aria-invalid={Boolean(validation.due_on)}
            aria-describedby={
              validation.due_on ? `${formId}-validation` : undefined
            }
          />
        </Field>
        <Field labelText={copy.notesLabel}>
          <TextArea
            name="notes"
            value={input.notes}
            maxLength={10000}
            disabled={mutation.isPending}
            onChange={(event) => change('notes', event.target.value)}
          />
        </Field>
        {Object.values(validation).some(Boolean) && (
          <p
            id={`${formId}-validation`}
            role="alert"
            className="text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        <MutationError error={mutation.error} />
        {mutation.error instanceof DomainError &&
          mutation.error.status === 409 && (
            <Button
              variant="secondary"
              onClick={async () => {
                if (!(await confirmLeave())) return;
                await cache.invalidateQueries({
                  queryKey: applicationQueryKeys.all,
                });
                onClose();
              }}
            >
              {copy.reloadAction}
            </Button>
          )}
      </form>
    </Modal>
  );
}
