import { useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Field,
  FormSection,
  IconButton,
  Input,
  Modal,
  ReorderableList,
  Select,
  TextArea,
  UiIcon,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathPollStrings as copy } from '@/strings';
import { PollInputSchema, type Poll, type PollInput } from '../models/poll';
import type { PollOptionDraft } from '../models/pollOptionDraft';
import { PollSelectionModeSchema } from '../models/pollSelectionMode';
import { useSavePoll } from '../hooks';

export function PollEditor({
  poll,
  writable,
  onClose,
  onSaved,
}: {
  poll?: Poll;
  writable: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [input, setInput] = useState<Omit<PollInput, 'options'>>({
    title: poll?.title ?? '',
    message: poll?.message ?? '',
    selectionMode: poll?.selectionMode ?? 'SINGLE',
    tags: poll?.tags ?? [],
  });
  const [tags, setTags] = useState(poll?.tags.join(', ') ?? '');
  const [options, setOptions] = useState<PollOptionDraft[]>(() =>
    poll
      ? poll.options.map((option) => ({
          id: option.id,
          retainedId: option.id,
          text: option.text,
        }))
      : Array.from({ length: 2 }, () => ({
          id: crypto.randomUUID(),
          text: '',
        })),
  );
  const [validation, setValidation] = useState<Record<string, string>>({});
  const mutation = useSavePoll();
  const dirty = useRef(false);
  const busy = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const { showToast } = usePresentationService();
  const locked = Boolean(
    poll && (poll.votingLocked || poll.participantsCount > 0),
  );
  const disabled = mutation.isPending || !writable;
  function change<Key extends keyof typeof input>(
    key: Key,
    value: (typeof input)[Key],
  ) {
    dirty.current = true;
    setInput((current) => ({ ...current, [key]: value }));
    setValidation((current) => ({ ...current, [key]: '' }));
  }
  function changeOptions(next: PollOptionDraft[]) {
    dirty.current = true;
    setOptions(next);
    setValidation((current) => ({ ...current, options: '' }));
  }
  function close() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !writable) return;
    const parsed = PollInputSchema.safeParse({
      ...input,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      options: options.map((option) => ({
        ...(option.retainedId ? { id: option.retainedId } : {}),
        text: option.text,
      })),
    });
    if (!parsed.success) {
      const issues = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0]),
          issue.message,
        ]),
      );
      setValidation(issues);
      const path = parsed.error.issues[0].path;
      const name =
        path[0] === 'options'
          ? `option-${typeof path[1] === 'number' ? path[1] : 0}`
          : String(path[0]);
      formRef.current?.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();
      return;
    }
    busy.current = true;
    try {
      await mutation.mutateAsync({ input: parsed.data, id: poll?.id });
      dirty.current = false;
      void showToast({
        title: poll ? copy.updated : copy.created,
        intent: 'success',
      });
      onSaved?.();
      onClose();
    } catch {
      /* Keep the draft for correction or retry. */
    } finally {
      busy.current = false;
    }
  }
  const historyConflict =
    (mutation.error as { status?: number } | null)?.status === 409;
  return (
    <Modal
      open
      title={poll ? copy.editPoll : copy.newPoll}
      description={copy.formDescription}
      onDismiss={close}
    >
      <form ref={formRef} noValidate onSubmit={submit} className="grid gap-5">
        {locked && (
          <div className="rounded-xl bg-secondary_subtle p-4">
            <h3 className="m-0 text-sm font-semibold">{copy.lockedTitle}</h3>
            <p className="m-0 mt-1 text-sm text-secondary">
              {copy.lockedDescription}
            </p>
          </div>
        )}
        <Field labelText={copy.titleLabel}>
          <Input
            name="title"
            maxLength={500}
            value={input.title}
            disabled={disabled || locked}
            placeholder={copy.questionPlaceholder}
            aria-invalid={Boolean(validation.title)}
            aria-describedby={validation.title ? 'poll-validation' : undefined}
            onChange={(event) => change('title', event.target.value)}
          />
        </Field>
        <Field labelText={copy.messageLabel}>
          <TextArea
            name="message"
            rows={5}
            maxLength={20000}
            value={input.message}
            disabled={disabled || locked}
            placeholder={copy.messagePlaceholder}
            aria-invalid={Boolean(validation.message)}
            aria-describedby={
              validation.message ? 'poll-validation' : undefined
            }
            onChange={(event) => change('message', event.target.value)}
          />
        </Field>
        <Field labelText={copy.modeLabel}>
          <Select
            name="selectionMode"
            value={input.selectionMode}
            disabled={disabled || locked}
            onValueChange={(value) =>
              change('selectionMode', PollSelectionModeSchema.parse(value))
            }
          >
            {Object.entries(copy.modes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <FormSection
          id="poll-options"
          title={copy.optionsTitle}
          description={copy.optionsHint}
        >
          <ReorderableList
            items={options}
            disabled={disabled}
            label={copy.optionsTitle}
            handleLabel={(option) =>
              copy.dragOption(options.indexOf(option) + 1)
            }
            upLabel={(option) => copy.moveUp(options.indexOf(option) + 1)}
            downLabel={(option) => copy.moveDown(options.indexOf(option) + 1)}
            onMove={(id, targetId) => {
              const next = [...options];
              const from = next.findIndex((option) => option.id === id);
              const target = next.findIndex((option) => option.id === targetId);
              if (from < 0 || target < 0) return;
              const [moved] = next.splice(from, 1);
              next.splice(target, 0, moved);
              changeOptions(next);
            }}
            renderItem={(option, index, controls, handle) => (
              <div className="gp-poll-option-editor">
                <div className="gp-poll-option-editor__field">
                  {handle}
                  <Field
                    labelText={copy.optionLabel(index + 1)}
                    className="flex-1"
                  >
                    <Input
                      name={`option-${index}`}
                      value={option.text}
                      maxLength={500}
                      placeholder={copy.optionPlaceholder}
                      disabled={disabled || locked}
                      aria-invalid={Boolean(validation.options)}
                      aria-describedby={
                        validation.options ? 'poll-validation' : undefined
                      }
                      onChange={(event) =>
                        changeOptions(
                          options.map((item) =>
                            item.id === option.id
                              ? { ...item, text: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </Field>
                </div>
                <div className="flex items-center justify-end gap-1">
                  {controls}
                  {!locked && (
                    <IconButton
                      variant="destructive"
                      label={copy.removeOption(index + 1)}
                      disabled={disabled || options.length <= 2}
                      onClick={() =>
                        changeOptions(
                          options.filter((item) => item.id !== option.id),
                        )
                      }
                    >
                      <UiIcon name="trash" />
                    </IconButton>
                  )}
                </div>
              </div>
            )}
          />
          {!locked && (
            <Button
              className="justify-self-start"
              variant="secondary"
              disabled={disabled || options.length >= 100}
              onClick={() =>
                changeOptions([
                  ...options,
                  { id: crypto.randomUUID(), text: '' },
                ])
              }
            >
              <UiIcon name="plus" />
              {copy.addOption}
            </Button>
          )}
        </FormSection>
        <div className="grid gap-2">
          <Field labelText={copy.tagsLabel}>
            <Input
              name="tags"
              value={tags}
              disabled={disabled}
              placeholder={copy.tagsPlaceholder}
              aria-invalid={Boolean(validation.tags)}
              aria-describedby={
                validation.tags ? 'poll-validation' : 'poll-tags-hint'
              }
              onChange={(event) => {
                dirty.current = true;
                setTags(event.target.value);
                setValidation((current) => ({ ...current, tags: '' }));
              }}
            />
          </Field>
          <p id="poll-tags-hint" className="m-0 text-xs text-tertiary">
            {copy.tagsHint}
          </p>
        </div>
        {Object.values(validation).some(Boolean) && (
          <p
            id="poll-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        {historyConflict ? (
          <div
            role="alert"
            className="rounded-xl border border-error_subtle bg-error-primary p-4"
          >
            <h3 className="m-0 text-sm font-semibold">{copy.conflictTitle}</h3>
            <p className="m-0 mt-1 text-sm text-error-primary">
              {copy.conflictDescription}
            </p>
          </div>
        ) : (
          <MutationError error={mutation.error} />
        )}
        <div className="flex flex-wrap justify-end gap-3 border-t border-secondary pt-5">
          <Button
            variant="secondary"
            disabled={mutation.isPending}
            onClick={close}
          >
            {copy.cancel}
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!writable}
          >
            {poll ? copy.save : copy.newPoll}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
