'use client';
import { useRef, useState, type FormEvent } from 'react';
import {
  BookmarkButton,
  Button,
  Field,
  FormActions,
  Input,
  Modal,
  Select,
  TextArea,
} from '@/components/ui';
import { MutationError } from '@/modules/portal/components/MutationError';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathMilestoneAdminStrings as copy } from '@/strings';
import type { MilestoneGuidance } from '../models/milestoneGuidance';
import {
  MilestoneObservationInputSchema,
  type MilestoneObservation,
} from '../models/milestoneObservation';
import {
  useDeleteMilestoneObservation,
  useSaveMilestoneObservation,
} from '../hooks';
import {
  observationInstant,
  observationLocalDateTime,
} from '../observationDateTime';
const emptyResponseChoice = '';
interface MilestoneObservationEditorProps {
  childId: string;
  milestone: MilestoneGuidance;
  observation?: MilestoneObservation;
  onClose: () => void;
  onDeleted?: () => void;
}
export function MilestoneObservationEditor({
  childId,
  milestone,
  observation,
  onClose,
  onDeleted,
}: MilestoneObservationEditorProps) {
  const activeOptions = (milestone.response_options ?? []).filter(
    (option) => !option.deleted,
  );
  const retired = observation?.response_option?.deleted
    ? observation.response_option
    : undefined;
  const options =
    retired && !activeOptions.some((option) => option.id === retired.id)
      ? [...activeOptions, retired]
      : activeOptions;
  const [response, setResponse] = useState(
    observation?.response_option_id ?? options[0]?.id ?? '',
  );
  const [observedAt, setObservedAt] = useState(() =>
    observationLocalDateTime(
      observation?.observed_at ?? new Date().toISOString(),
    ),
  );
  const [notes, setNotes] = useState(observation?.notes ?? '');
  const [validation, setValidation] = useState<Record<string, string>>({});
  const dirty = useRef(false),
    busy = useRef(false);
  const leave = useUnsavedFormGuard(dirty, busy);
  const save = useSaveMilestoneObservation();
  const remove = useDeleteMilestoneObservation();
  const [confirming, setConfirming] = useState(false);
  const pending = save.isPending || remove.isPending || confirming;
  const { showAlert, showToast } = usePresentationService();
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
  async function deleteObservation() {
    if (!observation || busy.current) return;
    busy.current = true;
    setConfirming(true);
    try {
      if (
        !(await showAlert({
          title: copy.observationDeleteTitle,
          description: copy.observationDeleteDescription,
          tone: 'danger',
          confirmLabel: copy.observationDelete,
          cancelLabel: copy.cancel,
        }))
      )
        return;
      await remove.mutateAsync(observation.id);
      dirty.current = false;
      onDeleted?.();
      void showToast({ title: copy.observationDeleted, intent: 'success' });
      onClose();
    } catch {
      /* Keep the observation and draft available for recovery. */
    } finally {
      busy.current = false;
      setConfirming(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const result = MilestoneObservationInputSchema.safeParse({
      child_id: childId,
      milestone_id: milestone.id,
      response_option_id: response,
      observed_at: observationInstant(observedAt),
      notes: notes.trim() || null,
    });
    if (!result.success) {
      setValidation(
        Object.fromEntries(
          result.error.issues.map((issue) => [
            String(issue.path[0]),
            issue.message,
          ]),
        ),
      );
      const first = String(result.error.issues[0].path[0]);
      event.currentTarget
        .querySelector<HTMLElement>(
          first === 'response_option_id'
            ? '.ui-select-trigger'
            : first === 'observed_at'
              ? '[name="observed_at"]'
              : '[name="notes"]',
        )
        ?.focus();
      return;
    }
    busy.current = true;
    try {
      await save.mutateAsync({ input: result.data, id: observation?.id });
      dirty.current = false;
      void showToast({ title: copy.observationSaved, intent: 'success' });
      onClose();
    } catch {
      /* Keep date, choice and private notes in memory. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <Modal
      open
      title={observation ? copy.observationEditTitle : copy.observationTitle}
      description={copy.observationDescription}
      onDismiss={dismiss}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <p className="m-0 font-display text-xl text-primary wrap-anywhere">
          {milestone.milestone}
        </p>
        {milestone.observation_guidance && (
          <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-secondary wrap-anywhere">
            {milestone.observation_guidance}
          </p>
        )}
        <Field labelText={copy.responseLabel}>
          <Select
            name="response_option_id"
            value={response}
            disabled={pending}
            aria-invalid={Boolean(validation.response_option_id)}
            aria-describedby={
              validation.response_option_id
                ? 'observation-validation'
                : retired
                  ? 'observation-retired-hint'
                  : undefined
            }
            onValueChange={(value) => change(() => setResponse(value))}
          >
            <option value={emptyResponseChoice}>
              {copy.responsePlaceholder}
            </option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.deleted
                  ? copy.retiredOption(option.label)
                  : option.label}
              </option>
            ))}
          </Select>
        </Field>
        {retired && (
          <p
            id="observation-retired-hint"
            className="m-0 text-xs text-tertiary"
          >
            {copy.retiredOptionHint}
          </p>
        )}
        <Field labelText={copy.observedAtLabel}>
          <Input
            type="datetime-local"
            name="observed_at"
            step={1}
            value={observedAt}
            max={observationLocalDateTime(new Date().toISOString())}
            disabled={pending}
            aria-invalid={Boolean(validation.observed_at)}
            aria-describedby={
              validation.observed_at ? 'observation-validation' : undefined
            }
            onChange={(event) =>
              change(() => setObservedAt(event.target.value))
            }
          />
        </Field>
        <Field labelText={copy.observationNotesLabel}>
          <TextArea
            name="notes"
            value={notes}
            maxLength={20000}
            disabled={pending}
            autoGrow
            aria-invalid={Boolean(validation.notes)}
            aria-describedby={
              validation.notes ? 'observation-validation' : undefined
            }
            onChange={(event) => change(() => setNotes(event.target.value))}
          />
        </Field>
        {observation && (
          <p className="m-0 text-xs text-tertiary">
            {copy.observationIdentityHint}
          </p>
        )}
        {Object.keys(validation).length > 0 && (
          <p
            id="observation-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {Object.values(validation).join(' ')}
          </p>
        )}
        <MutationError error={save.error ?? remove.error} />
        <FormActions variant="inline" sticky={false}>
          {observation && (
            <Button
              variant="destructive"
              className="sm:mr-auto"
              disabled={pending}
              onClick={() => void deleteObservation()}
            >
              {copy.observationDelete}
            </Button>
          )}
          <Button variant="secondary" onClick={dismiss} disabled={pending}>
            {copy.cancel}
          </Button>
          <BookmarkButton
            type="submit"
            loading={save.isPending}
            disabled={remove.isPending || confirming}
          >
            {copy.observationSave}
          </BookmarkButton>
        </FormActions>
      </form>
    </Modal>
  );
}
