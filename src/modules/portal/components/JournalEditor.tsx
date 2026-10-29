import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Input, Modal, Select, TextArea } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import {
  JournalInputSchema,
  type JournalEntry,
  type JournalInput,
} from '../models/journalEntry';
import type { ChildProfile } from '../models/childProfile';
import { useSaveJournal } from '../hooks';
import { MutationError } from './MutationError';

const personalJournalId = '';

interface JournalEditorProps {
  entry?: JournalEntry;
  childrenProfiles: ChildProfile[];
  onClose: () => void;
}
export function JournalEditor({
  entry,
  childrenProfiles,
  onClose,
}: JournalEditorProps) {
  const [input, setInput] = useState<JournalInput>(
    entry
      ? {
          title: entry.title,
          body: entry.body,
          emotion: entry.emotion,
          childId: entry.childId,
        }
      : { title: String(), body: '', emotion: 'hopeful', childId: null },
  );
  const [validation, setValidation] = useState<Record<string, string>>({});
  const mutation = useSaveJournal();
  const { showToast } = usePresentationService();
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  function change<Key extends keyof JournalInput>(
    key: Key,
    value: JournalInput[Key],
  ) {
    dirty.current = true;
    setInput((current) => ({ ...current, [key]: value }));
    setValidation((current) => ({ ...current, [key]: '' }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = JournalInputSchema.safeParse(input);
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
      await mutation.mutateAsync({ input: parsed.data, id: entry?.id });
      dirty.current = false;
      void showToast({
        title: entry ? copy.journal.updated : copy.journal.created,
        intent: 'success',
      });
      onClose();
    } catch {
      /* The form keeps its draft and shows the mutation error. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Modal
      open
      title={entry ? copy.journal.editTitle : copy.journal.newTitle}
      description={copy.journal.formDescription}
      onDismiss={() => {
        void confirmLeave().then((allowed) => {
          if (allowed) onClose();
        });
      }}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={copy.journal.titleLabel}>
          <Input
            name="title"
            value={input.title}
            maxLength={160}
            placeholder={copy.journal.titlePlaceholder}
            aria-invalid={Boolean(validation.title)}
            aria-describedby={
              validation.title ? 'journal-validation' : undefined
            }
            onChange={(event) => change('title', event.target.value)}
            disabled={mutation.isPending}
          />
        </Field>
        <Field labelText={copy.journal.bodyLabel}>
          <TextArea
            name="body"
            rows={7}
            value={input.body}
            maxLength={20000}
            placeholder={copy.journal.bodyPlaceholder}
            aria-invalid={Boolean(validation.body)}
            aria-describedby={
              validation.body ? 'journal-validation' : undefined
            }
            onChange={(event) => change('body', event.target.value)}
            disabled={mutation.isPending}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText={copy.journal.emotionLabel}>
            <Select
              value={input.emotion}
              onValueChange={(value) =>
                change('emotion', JournalInputSchema.shape.emotion.parse(value))
              }
              disabled={mutation.isPending}
            >
              {Object.entries(copy.journal.emotions).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field labelText={copy.journal.childLabel}>
            <Select
              value={input.childId ?? ''}
              onValueChange={(value) => change('childId', value || null)}
              disabled={mutation.isPending}
            >
              <option value={personalJournalId}>{copy.journal.personal}</option>
              {childrenProfiles.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        {Object.values(validation).some(Boolean) && (
          <p
            id="journal-validation"
            role="alert"
            className="text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        <MutationError error={mutation.error} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-secondary pt-5">
          <Button
            variant="secondary"
            disabled={mutation.isPending}
            onClick={() => {
              void confirmLeave().then((allowed) => {
                if (allowed) onClose();
              });
            }}
          >
            {copy.common.cancel}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {copy.journal.publish}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
