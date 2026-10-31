import { useId, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  BookmarkButton,
  Field,
  Input,
  Modal,
  MultiSelect,
  Select,
  TextArea,
  UiIcon,
} from '@/components/ui';
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
  onDelete?: () => Promise<boolean>;
  removing?: boolean;
  removalError?: Error | null;
}
export function JournalEditor({
  entry,
  childrenProfiles,
  onClose,
  onDelete,
  removing = false,
  removalError,
}: JournalEditorProps) {
  const formId = useId();
  const [input, setInput] = useState<JournalInput>(
    entry
      ? {
          title: entry.title,
          body: entry.body,
          emotions: entry.emotions,
          childId: entry.childId,
        }
      : {
          title: String(),
          body: '',
          emotions: ['hopeful'],
          childId: childrenProfiles[0]?.id ?? null,
        },
  );
  const presetEmotions = Object.entries(copy.journal.emotions).map(
    ([value, label]) => ({ value, label }),
  );
  const emotionOptions = [
    ...presetEmotions,
    ...(entry?.emotions ?? [])
      .filter(
        (emotion) => !presetEmotions.some((option) => option.value === emotion),
      )
      .map((emotion) => ({ value: emotion, label: emotion })),
  ];
  const emotionsRef = useRef<HTMLButtonElement>(null);
  const [validation, setValidation] = useState<Record<string, string>>({});
  const mutation = useSaveJournal();
  const { showToast } = usePresentationService();
  const dirty = useRef(false);
  const busy = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const pending = mutation.isPending || removing;
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
      if (parsed.error.issues[0].path[0] === 'emotions') {
        emotionsRef.current?.focus();
        return;
      }
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

      footer={
        <div className="flex flex-wrap justify-end gap-3">
          {entry && onDelete && (
            <Button
              variant="destructive"
              className="mr-auto"
              disabled={pending}
              onClick={() => {
                if (busy.current) return;
                busy.current = true;
                void onDelete()
                  .then((deleted) => {
                    if (!deleted) return;
                    dirty.current = false;
                    onClose();
                  })
                  .finally(() => {
                    busy.current = false;
                  });
              }}
            >
              <UiIcon name="trash" className="size-4" />
              {copy.journal.deleteAction}
            </Button>
          )}
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => {
              void confirmLeave().then((allowed) => {
                if (allowed) onClose();
              });
            }}
          >
            {copy.common.cancel}
          </Button>
          <BookmarkButton
            type="submit"
            form={formId}
            loading={mutation.isPending}
            disabled={removing}
          >
            {copy.journal.publish}
          </BookmarkButton>
        </div>
      }
    >
      <form id={formId} noValidate onSubmit={submit} className="grid gap-5">
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
            disabled={pending}
          />
        </Field>
        <Field labelText={copy.journal.bodyLabel}>
          <TextArea
            name="body"
            value={input.body}
            maxLength={20000}
            placeholder={copy.journal.bodyPlaceholder}
            aria-invalid={Boolean(validation.body)}
            aria-describedby={
              validation.body ? 'journal-validation' : undefined
            }
            onChange={(event) => change('body', event.target.value)}
            disabled={pending}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText={copy.journal.emotionLabel}>
            <MultiSelect
              ref={emotionsRef}
              value={input.emotions}
              options={emotionOptions}
              onValueChange={(value) => change('emotions', value)}
              label={copy.journal.emotionLabel}
              placeholder={copy.journal.emotionsPlaceholder}
              selectionLabel={copy.journal.selectedEmotions}
              clearLabel={copy.journal.clearEmotions}
              aria-invalid={Boolean(validation.emotions)}
              aria-describedby={
                validation.emotions ? 'journal-validation' : undefined
              }
              disabled={pending}
            />
          </Field>
          <Field labelText={copy.journal.childLabel}>
            <Select
              value={input.childId ?? ''}
              onValueChange={(value) => change('childId', value || null)}
              disabled={pending}
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
        <MutationError error={removalError} />
      </form>
    </Modal>
  );
}
