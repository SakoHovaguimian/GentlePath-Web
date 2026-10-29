import { useState, type FormEvent } from 'react';
import { Button, Field, Input, Select } from '@/components/ui';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { NotificationDeliveryQuerySchema } from '../models/notificationDeliveryQuery';

const allStatuses = '';

export function deliveryDateBoundary(date: string, end = false) {
  if (!date) return undefined;
  const parsed = new Date(`${date}T${end ? '23:59:59.999' : '00:00:00.000'}`);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed.toISOString();
}

export function DeliveryFilters({
  values,
  onChange,
}: {
  values: {
    status: string;
    notification: string;
    after: string;
    before: string;
  };
  onChange: (values: Record<string, string | undefined>) => void;
}) {
  const [input, setInput] = useState(values);
  const [validation, setValidation] = useState<Record<string, string>>({});
  function change(key: keyof typeof input, value: string) {
    setInput((current) => ({ ...current, [key]: value }));
    setValidation({});
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = NotificationDeliveryQuerySchema.safeParse({
      status: input.status || undefined,
      notificationId: input.notification.trim() || undefined,
      createdAfter: deliveryDateBoundary(input.after),
      createdBefore: deliveryDateBoundary(input.before),
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        errors[
          issue.path[0] === 'notificationId'
            ? 'notification'
            : issue.path[0] === 'createdBefore'
              ? 'before'
              : 'after'
        ] =
          issue.path[0] === 'notificationId'
            ? copy.validation.notificationId
            : copy.validation.dateRange;
      });
      setValidation(errors);
      event.currentTarget
        .querySelector<HTMLElement>(`[name="${Object.keys(errors)[0]}"]`)
        ?.focus();
      return;
    }
    onChange({
      status: input.status || undefined,
      notification: input.notification.trim() || undefined,
      after: input.after || undefined,
      before: input.before || undefined,
      offset: undefined,
    });
  }
  return (
    <form noValidate onSubmit={submit} className="grid gap-4">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Field labelText={copy.deliveries.statusLabel}>
          <Select
            name="status"
            value={input.status}
            onValueChange={(value) => change('status', value)}
          >
            <option value={allStatuses}>{copy.deliveries.allStatuses}</option>
            {Object.entries(copy.deliveries.statuses).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field labelText={copy.deliveries.notificationLabel}>
          <Input
            name="notification"
            value={input.notification}
            maxLength={36}
            placeholder={copy.deliveries.notificationPlaceholder}
            aria-invalid={Boolean(validation.notification)}
            aria-describedby={
              validation.notification ? 'delivery-filter-validation' : undefined
            }
            onChange={(event) => change('notification', event.target.value)}
          />
        </Field>
        <Field labelText={copy.deliveries.afterLabel}>
          <Input
            name="after"
            type="date"
            value={input.after}
            aria-invalid={Boolean(validation.after)}
            aria-describedby={
              validation.after ? 'delivery-filter-validation' : undefined
            }
            onChange={(event) => change('after', event.target.value)}
          />
        </Field>
        <Field labelText={copy.deliveries.beforeLabel}>
          <Input
            name="before"
            type="date"
            value={input.before}
            aria-invalid={Boolean(validation.before)}
            aria-describedby={
              validation.before ? 'delivery-filter-validation' : undefined
            }
            onChange={(event) => change('before', event.target.value)}
          />
        </Field>
      </div>
      {Object.keys(validation).length > 0 && (
        <p
          id="delivery-filter-validation"
          role="alert"
          className="m-0 text-sm text-error-primary"
        >
          {Object.values(validation).join(' ')}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="secondary">
          {copy.deliveries.applyAction}
        </Button>
        {Object.values(input).some(Boolean) && (
          <Button
            variant="ghost"
            onClick={() => {
              setInput({ status: '', notification: '', after: '', before: '' });
              setValidation({});
              onChange({
                status: undefined,
                notification: undefined,
                after: undefined,
                before: undefined,
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
