import { useRef, useState, type FormEvent } from 'react';
import { Button, Field, Input, Modal, TextArea } from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import {
  AIUsageEventInputSchema,
  type AIUsageEvent,
} from '../models/aiUsageEvent';
import { useSaveAIUsage } from '../hooks';

export function AIUsageEditor({
  record,
  onClose,
}: {
  record?: AIUsageEvent;
  onClose: () => void;
}) {
  const initial = {
    context: record?.context ?? '',
    userId: record?.userId ?? '',
    inputTokens: record?.inputTokens?.toString() ?? '',
    outputTokens: record?.outputTokens?.toString() ?? '',
    totalTokens: record?.totalTokens?.toString() ?? '',
    metadata: record?.metadata ? JSON.stringify(record.metadata, null, 2) : '',
    error: record?.error ?? '',
  };
  const [input, setInput] = useState(initial);
  const baseline = useRef(JSON.stringify(initial));
  const [validation, setValidation] = useState<Record<string, string>>({});
  const busy = useRef(false);
  const dirty = useRef(false);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const save = useSaveAIUsage();
  const presentation = usePresentationService();
  function change(key: keyof typeof input, value: string) {
    const next = { ...input, [key]: value };
    setInput(next);
    dirty.current = JSON.stringify(next) !== baseline.current;
    setValidation((current) => ({ ...current, [key]: '' }));
    save.reset();
  }
  function close() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = event.currentTarget;
    let metadata: unknown = null;
    try {
      metadata = input.metadata.trim() ? JSON.parse(input.metadata) : null;
      if (
        metadata !== null &&
        (typeof metadata !== 'object' || Array.isArray(metadata))
      )
        throw new Error();
    } catch {
      setValidation({ metadata: copy.validation.metadata });
      form.querySelector<HTMLElement>('[name="metadata"]')?.focus();
      return;
    }
    const count = (value: string) => (value.trim() ? Number(value) : null);
    const parsed = AIUsageEventInputSchema.safeParse({
      context: input.context,
      userId: input.userId.trim() || null,
      inputTokens: count(input.inputTokens),
      outputTokens: count(input.outputTokens),
      totalTokens: count(input.totalTokens),
      metadata,
      error: input.error.trim() || null,
    });
    if (!parsed.success) {
      setValidation(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            String(issue.path[0]),
            ['inputTokens', 'outputTokens', 'totalTokens'].includes(
              String(issue.path[0]),
            )
              ? copy.validation.tokenCount
              : issue.message,
          ]),
        ),
      );
      form
        .querySelector<HTMLElement>(
          `[name="${String(parsed.error.issues[0].path[0])}"]`,
        )
        ?.focus();
      return;
    }
    busy.current = true;
    try {
      await save.mutateAsync({ input: parsed.data, id: record?.id });
      dirty.current = false;
      void presentation.showToast({
        title: record ? copy.aiUsage.updatedTitle : copy.aiUsage.createdTitle,
        intent: 'success',
      });
      onClose();
    } catch {
      /* Keep all entered values for correction or retry. */
    } finally {
      busy.current = false;
    }
  }
  const describedBy = (name: keyof typeof input) =>
    validation[name] ? 'ai-usage-validation' : undefined;
  return (
    <Modal
      open
      title={record ? copy.aiUsage.editTitle : copy.aiUsage.newTitle}
      description={copy.aiUsage.formDescription}
      onDismiss={close}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={copy.aiUsage.contextLabel}>
          <Input
            name="context"
            value={input.context}
            maxLength={500}
            placeholder={copy.aiUsage.contextPlaceholder}
            disabled={save.isPending}
            aria-invalid={Boolean(validation.context)}
            aria-describedby={describedBy('context')}
            onChange={(event) => change('context', event.target.value)}
          />
        </Field>
        <Field labelText={copy.aiUsage.userLabel}>
          <Input
            name="userId"
            value={input.userId}
            maxLength={36}
            placeholder={copy.aiUsage.userPlaceholder}
            disabled={save.isPending}
            aria-invalid={Boolean(validation.userId)}
            aria-describedby={describedBy('userId')}
            onChange={(event) => change('userId', event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              { name: 'inputTokens', label: copy.aiUsage.inputLabel },
              { name: 'outputTokens', label: copy.aiUsage.outputLabel },
              { name: 'totalTokens', label: copy.aiUsage.totalLabel },
            ] as const
          ).map(({ name, label }) => (
            <Field key={name} labelText={label}>
              <Input
                name={name}
                type="number"
                min={0}
                max={2147483647}
                step={1}
                inputMode="numeric"
                value={input[name]}
                disabled={save.isPending}
                aria-invalid={Boolean(validation[name])}
                aria-describedby={describedBy(name)}
                onChange={(event) => change(name, event.target.value)}
              />
            </Field>
          ))}
        </div>
        <Field labelText={copy.aiUsage.metadataLabel}>
          <TextArea
            name="metadata"
            rows={6}
            value={input.metadata}
            maxLength={100000}
            placeholder={copy.aiUsage.metadataPlaceholder}
            disabled={save.isPending}
            aria-invalid={Boolean(validation.metadata)}
            aria-describedby={
              validation.metadata
                ? 'ai-usage-metadata-hint ai-usage-validation'
                : 'ai-usage-metadata-hint'
            }
            onChange={(event) => change('metadata', event.target.value)}
          />
        </Field>
        <p id="ai-usage-metadata-hint" className="m-0 text-sm text-secondary">
          {copy.aiUsage.metadataHint}
        </p>
        <Field labelText={copy.aiUsage.errorLabel}>
          <TextArea
            name="error"
            rows={3}
            value={input.error}
            maxLength={5000}
            placeholder={copy.aiUsage.errorPlaceholder}
            disabled={save.isPending}
            aria-invalid={Boolean(validation.error)}
            aria-describedby={describedBy('error')}
            onChange={(event) => change('error', event.target.value)}
          />
        </Field>
        {Object.values(validation).some(Boolean) && (
          <p
            id="ai-usage-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {Object.values(validation).filter(Boolean).join(' ')}
          </p>
        )}
        <MutationError error={save.error} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-secondary pt-5">
          <Button variant="secondary" disabled={save.isPending} onClick={close}>
            {copy.common.cancelAction}
          </Button>
          <Button type="submit" loading={save.isPending}>
            {record ? copy.common.saveAction : copy.aiUsage.newAction}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
