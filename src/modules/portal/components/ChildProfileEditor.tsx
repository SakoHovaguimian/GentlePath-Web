import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Input, Modal, TextArea } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import {
  ChildProfileInputSchema,
  type ChildProfile,
  type ChildProfileInput,
} from '../models/childProfile';
import { useSaveChild } from '../hooks';
import { MutationError } from './MutationError';

export function ChildProfileEditor({
  child,
  onClose,
}: {
  child?: ChildProfile;
  onClose: () => void;
}) {
  const [input, setInput] = useState<ChildProfileInput>({
    name: child?.name ?? '',
    dateOfBirth: child?.dateOfBirth ?? '',
    supportNotes: child?.supportNotes ?? '',
  });
  const [validation, setValidation] = useState<Record<string, string>>({});
  const mutation = useSaveChild();
  const { showToast } = usePresentationService();
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  function change(key: keyof ChildProfileInput, value: string) {
    dirty.current = true;
    setInput((current) => ({ ...current, [key]: value }));
    setValidation((current) => ({ ...current, [key]: '' }));
  }
  function dismiss() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = ChildProfileInputSchema.safeParse(input);
    if (!parsed.success) {
      setValidation(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      event.currentTarget
        .querySelector<HTMLElement>(
          `[name="${String(parsed.error.issues[0].path[0])}"]`,
        )
        ?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({ input: parsed.data, id: child?.id });
      dirty.current = false;
      void showToast({ title: copy.family.created, intent: 'success' });
      onClose();
    } catch {
      /* Keep the draft. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Modal
      open
      title={child ? copy.family.editTitle : copy.family.newTitle}
      description={copy.family.formDescription}
      onDismiss={dismiss}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={copy.family.nameLabel}>
          <Input
            name="name"
            value={input.name}
            maxLength={100}
            onChange={(event) => change('name', event.target.value)}
            aria-invalid={Boolean(validation.name)}
            aria-describedby={validation.name ? 'child-validation' : undefined}
            disabled={mutation.isPending}
          />
        </Field>
        <Field labelText={copy.family.birthDateLabel}>
          <Input
            name="dateOfBirth"
            type="date"
            value={input.dateOfBirth}
            onChange={(event) => change('dateOfBirth', event.target.value)}
            aria-invalid={Boolean(validation.dateOfBirth)}
            aria-describedby={
              validation.dateOfBirth ? 'child-validation' : undefined
            }
            disabled={mutation.isPending}
          />
        </Field>
        <Field labelText={copy.family.notesLabel}>
          <TextArea
            value={input.supportNotes}
            rows={4}
            maxLength={2000}
            placeholder={copy.family.notesPlaceholder}
            onChange={(event) => change('supportNotes', event.target.value)}
            disabled={mutation.isPending}
          />
        </Field>
        {Object.values(validation).some(Boolean) && (
          <p
            id="child-validation"
            role="alert"
            className="text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        <MutationError error={mutation.error} />
        <div className="flex justify-end gap-3 border-t border-secondary pt-5">
          <Button
            variant="secondary"
            onClick={dismiss}
            disabled={mutation.isPending}
          >
            {copy.common.cancel}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {copy.family.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
