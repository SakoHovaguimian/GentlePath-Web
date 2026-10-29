'use client';
import { useRef, useState } from 'react';
import type { z } from 'zod';
import {
  Button,
  Card,
  Checkbox,
  Field,
  FormActions,
  FormSection,
  Input,
  Message,
  Select,
  Switch,
  TextArea,
} from '@/components/ui';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { MutationError } from '@/modules/portal/components/MutationError';
import { useCommercialMutation } from '../hooks';
import {
  commercialCreateSchemas,
  commercialUpdateSchemas,
  type CommercialEntity,
  type CommercialRecord,
} from '../models/commercialEntity';
import type { CommercialFormValues } from '../models/commercialFormField';
import {
  commercialFormFields,
  isoDateTime,
  localDateTime,
} from './commercialFormFields';
import { CommercialReferenceField } from './CommercialReferenceField';
interface CommercialContentFormProps {
  entity: CommercialEntity;
  record?: CommercialRecord;
  onSaved?: () => void;
}
export function CommercialContentForm({
  entity,
  record,
  onSaved,
}: CommercialContentFormProps) {
  const fields = commercialFormFields[entity].filter(
    (field) => !(record ? field.createOnly : field.editOnly),
  );
  const [values, setValues] = useState<CommercialFormValues>(
    () =>
      Object.fromEntries(
        fields.map((field) => {
          const raw = record
            ? (record as Record<string, unknown>)[field.key]
            : undefined;
          const fallback =
            field.kind === 'boolean'
              ? field.key === 'show_pagination'
              : field.kind === 'platforms'
                ? ['WEB']
                : field.options
                  ? Object.keys(field.options)[0]
                  : field.key === 'max_items'
                    ? '5'
                    : field.key === 'locale'
                      ? 'en'
                      : field.key === 'disclosure_label'
                        ? copy.sponsored
                        : '';
          return [
            field.key,
            field.kind === 'datetime'
              ? localDateTime(raw as string)
              : raw === null || raw === undefined
                ? fallback
                : field.kind === 'number'
                  ? String(raw)
                  : raw,
          ];
        }),
      ) as CommercialFormValues,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [invalid, setInvalid] = useState(false);
  const dirty = useRef(false);
  const busy = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  useUnsavedFormGuard(dirty, busy);
  const navigate = useGuardedNavigate();
  const { showToast } = usePresentationService();
  const save = useCommercialMutation((service, input: unknown) =>
    service.save(entity, input, record?.id),
  );
  const update = (key: string, value: string | boolean | string[]) => {
    dirty.current = true;
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
  };
  const destination = `/admin/commercial?tab=${entity}`;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const input = Object.fromEntries(
      fields.map((field) => {
        const value = values[field.key];
        return [
          field.key,
          field.optional && value === ''
            ? null
            : field.kind === 'datetime'
              ? isoDateTime(String(value))
              : field.kind === 'number'
                ? Number(value)
                : value,
        ];
      }),
    );
    const schema: z.ZodType = record
      ? commercialUpdateSchemas[entity]
      : commercialCreateSchemas[entity];
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      const next = Object.fromEntries(
        parsed.error.issues.map((issue) => [
          String(issue.path[0] ?? ''),
          Object.values(copy.validation).includes(
            issue.message as (typeof copy.validation)[keyof typeof copy.validation],
          )
            ? issue.message
            : copy.validation.invalid,
        ]),
      );
      setErrors(next);
      setInvalid(true);
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setInvalid(false);
    setErrors({});
    busy.current = true;
    try {
      const saved = await save.mutateAsync(parsed.data);
      dirty.current = false;
      void showToast({ title: copy.savedTitle, intent: 'success' });
      if (!record) {
        busy.current = false;
        void navigate(`/admin/commercial/${entity}/${saved.id}`);
      } else {
        onSaved?.();
      }
    } catch {
      /* Inline error preserves the draft. */
    } finally {
      busy.current = false;
    }
  }
  return (
    <form
      ref={form}
      noValidate
      onSubmit={submit}
      className="grid min-w-0 gap-5"
    >
      <Card>
        <FormSection
          id="commercial-content"
          title={copy.contentTitle}
          description={
            entity === 'placements' ? copy.attributionHint : copy.contentHint
          }
        >
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            {fields.map((field) => {
              const id = `commercial-${field.key}`;
              const value = values[field.key];
              const error = errors[field.key];
              const disabled =
                save.isPending ||
                (field.key === 'action_value' &&
                  values.action_type === 'COPY_DISCOUNT_CODE');
              const attrs = {
                id,
                disabled,
                'aria-invalid': Boolean(error),
                'aria-describedby': error ? `${id}-error` : undefined,
              };
              let control;
              if (field.kind === 'reference' && field.reference)
                control = (
                  <CommercialReferenceField
                    {...attrs}
                    entity={field.reference}
                    label={field.label}
                    value={String(value)}
                    optional={field.optional}
                    onChange={(next) => update(field.key, next)}
                  />
                );
              else if (field.kind === 'select')
                control = (
                  <Select
                    {...attrs}
                    value={String(value)}
                    onValueChange={(next) => {
                      update(field.key, next);
                      if (
                        field.key === 'action_type' &&
                        next === 'COPY_DISCOUNT_CODE'
                      )
                        update('action_value', '');
                    }}
                  >
                    {Object.entries(field.options ?? {}).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </Select>
                );
              else if (field.kind === 'textarea')
                control = (
                  <TextArea
                    {...attrs}
                    rows={5}
                    maxLength={field.max}
                    value={String(value)}
                    onChange={(event) => update(field.key, event.target.value)}
                  />
                );
              else if (field.kind === 'boolean')
                control = (
                  <Switch
                    {...attrs}
                    label={field.label}
                    checked={Boolean(value)}
                    onChange={(event) =>
                      update(field.key, event.target.checked)
                    }
                  />
                );
              else if (field.kind === 'platforms')
                control = (
                  <div
                    id={id}
                    role="group"
                    aria-labelledby={`${id}-label`}
                    aria-describedby={attrs['aria-describedby']}
                    className="flex flex-wrap gap-4"
                  >
                    {Object.entries(copy.platforms).map(([platform, label]) => (
                      <Checkbox
                        key={platform}
                        label={label}
                        disabled={disabled}
                        aria-invalid={Boolean(error)}
                        aria-describedby={attrs['aria-describedby']}
                        checked={
                          Array.isArray(value) && value.includes(platform)
                        }
                        onChange={(event) =>
                          update(
                            field.key,
                            event.target.checked
                              ? [...(value as string[]), platform]
                              : (value as string[]).filter(
                                  (item) => item !== platform,
                                ),
                          )
                        }
                      />
                    ))}
                  </div>
                );
              else
                control = (
                  <Input
                    {...attrs}
                    type={
                      field.kind === 'datetime'
                        ? 'datetime-local'
                        : field.kind === 'number'
                          ? 'number'
                          : field.kind === 'url'
                            ? 'url'
                            : field.kind === 'email'
                              ? 'email'
                              : 'text'
                    }
                    min={field.min}
                    max={field.kind === 'number' ? field.max : undefined}
                    maxLength={
                      field.kind !== 'number' ? (field.max ?? 1000) : undefined
                    }
                    value={String(value)}
                    onChange={(event) => update(field.key, event.target.value)}
                  />
                );
              return (
                <div
                  key={field.key}
                  className={
                    field.kind === 'textarea'
                      ? 'grid min-w-0 gap-1.5 sm:col-span-2'
                      : 'grid min-w-0 content-start gap-1.5'
                  }
                >
                  {field.kind === 'boolean' ? (
                    control
                  ) : (
                    <Field labelText={field.label}>{control}</Field>
                  )}
                  {error && (
                    <p
                      id={`${id}-error`}
                      className="m-0 text-sm text-error-primary"
                    >
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {entity === 'creatives' && (
            <p className="m-0 text-sm text-tertiary">{copy.actionHint}</p>
          )}
        </FormSection>
      </Card>
      {invalid && (
        <Message
          title={copy.errorTitle}
          description={copy.validation.invalid}
          intent="danger"
        />
      )}
      <MutationError error={save.error} />
      <FormActions sticky={false}>
        <Button
          type="button"
          variant="secondary"
          disabled={save.isPending}
          onClick={() => {
            void navigate(destination);
          }}
        >
          {copy.cancel}
        </Button>
        <Button type="submit" loading={save.isPending}>
          {record ? copy.save : copy.create}
        </Button>
      </FormActions>
    </form>
  );
}
