import { useId, useRef, useState, type FormEvent } from 'react';
import { Button, Field, Input, Modal, TextArea } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { ValidationError } from '@/errors/domainErrors';
import { MutationError } from '@/modules/portal/components/MutationError';
import {
  observationInstant,
  observationLocalDateTime,
} from '@/modules/milestone-admin/observationDateTime';
import { gentlePathGoalStrings as copy } from '@/strings';
import { GoalNoteInputSchema, type GoalNote } from '../models/goalNote';
import { useGoalActions } from '../hooks';

export function GoalNoteEditor({
  goalId,
  note,
  onClose,
}: {
  goalId: string;
  note?: GoalNote;
  onClose: () => void;
}) {
  const formId = useId();
  const actions = useGoalActions();
  const [message, setMessage] = useState(note?.message ?? '');
  const [date, setDate] = useState(() =>
    observationLocalDateTime(note?.occurred_at ?? new Date().toISOString()),
  );
  const [error, setError] = useState<unknown>(null);
  const dirty = useRef(false);
  const busy = useRef(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const { showToast } = usePresentationService();
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = GoalNoteInputSchema.safeParse({
      message,
      occurred_at: observationInstant(date),
    });
    if (!parsed.success) {
      setError(new ValidationError(copy.invalidNote));
      messageRef.current?.focus();
      return;
    }
    busy.current = true;
    try {
      await actions.saveNote.mutateAsync({
        id: goalId,
        input: parsed.data,
        noteId: note?.id,
      });
      dirty.current = false;
      void showToast({ title: copy.noteSaved, intent: 'success' });
      onClose();
    } catch (failure) {
      setError(failure);
    } finally {
      busy.current = false;
    }
  }
  function close() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  return (
    <Modal
      open
      title={note ? copy.editNote : copy.addNote}
      onDismiss={close}
      initialFocusRef={messageRef}
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={close}
            disabled={actions.saveNote.isPending}
          >
            {copy.cancel}
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={actions.saveNote.isPending}
          >
            {copy.saveNote}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        noValidate
        onSubmit={(event) => void submit(event)}
        className="grid gap-5"
      >
        <Field labelText={copy.noteDate}>
          <Input
            type="datetime-local"
            value={date}
            required
            disabled={actions.saveNote.isPending}
            onChange={(event) => {
              dirty.current = true;
              setDate(event.target.value);
              setError(null);
            }}
          />
        </Field>
        <Field labelText={copy.noteLabel}>
          <TextArea
            ref={messageRef}
            value={message}
            maxLength={10000}
            required
            disabled={actions.saveNote.isPending}
            onChange={(event) => {
              dirty.current = true;
              setMessage(event.target.value);
              setError(null);
            }}
          />
        </Field>
        <MutationError error={error} />
      </form>
    </Modal>
  );
}
