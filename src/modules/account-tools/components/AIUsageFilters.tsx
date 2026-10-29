import { useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Button, Field, Input } from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export function AIUsageFilters({
  values,
  onChange,
}: {
  values: { context: string; userId: string };
  onChange: (values: Record<string, string | undefined>) => void;
}) {
  const [input, setInput] = useState(values);
  const [validation, setValidation] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userId = input.userId.trim();
    if (
      userId &&
      userId !== 'system' &&
      !z.string().uuid().safeParse(userId).success
    ) {
      setValidation(copy.validation.userId);
      event.currentTarget
        .querySelector<HTMLElement>('[name="usageUser"]')
        ?.focus();
      return;
    }
    setValidation('');
    onChange({
      context: input.context.trim() || undefined,
      userId: userId || undefined,
      offset: undefined,
    });
  }
  return (
    <form noValidate onSubmit={submit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field labelText={copy.aiUsage.contextFilterLabel}>
          <Input
            value={input.context}
            maxLength={500}
            onChange={(event) =>
              setInput((current) => ({
                ...current,
                context: event.target.value,
              }))
            }
          />
        </Field>
        <Field labelText={copy.aiUsage.userLabel}>
          <Input
            name="usageUser"
            value={input.userId}
            maxLength={36}
            placeholder={copy.aiUsage.userPlaceholder}
            aria-invalid={Boolean(validation)}
            aria-describedby={
              validation ? 'usage-filter-validation' : undefined
            }
            onChange={(event) => {
              setInput((current) => ({
                ...current,
                userId: event.target.value,
              }));
              setValidation('');
            }}
          />
        </Field>
      </div>
      {validation && (
        <p
          id="usage-filter-validation"
          role="alert"
          className="m-0 text-sm text-error-primary"
        >
          {validation}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="secondary">
          {copy.aiUsage.applyFiltersAction}
        </Button>
        {(input.context || input.userId) && (
          <Button
            variant="ghost"
            onClick={() => {
              setInput({ context: '', userId: '' });
              setValidation('');
              onChange({
                context: undefined,
                userId: undefined,
                offset: undefined,
              });
            }}
          >
            {copy.common.clearFiltersAction}
          </Button>
        )}
      </div>
    </form>
  );
}
