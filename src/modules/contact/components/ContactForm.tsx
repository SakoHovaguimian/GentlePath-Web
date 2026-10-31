'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import {
  Button,
  Field,
  Input,
  Message,
  Select,
  TextArea,
  UiIcon,
} from '@/components/ui';
import { gentlePathContactStrings as copy } from '@/strings';
import { ContactContextSchema } from '@/modules/contact/models/contactContext';
import {
  ContactRequestSchema,
  type ContactRequest,
} from '@/modules/contact/models/contactRequest';
import { useContactRequest } from '@/modules/contact/useContactRequest';
import { usePresentationService } from '@/presentation/PresentationProvider';
import type { ContactFormProps } from '../models/contactFormProps';

const empty = '';

export function ContactForm({ service }: ContactFormProps) {
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const pending = useRef(false);
  const [input, setInput] = useState<ContactRequest>({
    name: '',
    email: '',
    context: 'INITIAL_CONTACT',
    message: empty,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mutation = useContactRequest(service);
  const { showToast } = usePresentationService();
  const busy = mutation.isPending;
  const update = (key: keyof ContactRequest, value: string) => {
    setInput((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    if (mutation.isSuccess || mutation.isError) mutation.reset();
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const parsed = ContactRequestSchema.safeParse(input);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            issue.path.join('.'),
            issue.message,
          ]),
        ),
      );
      const first = parsed.error.issues[0]?.path[0];
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${String(first)}"]`)
        ?.focus();
      return;
    }
    setErrors({});
    pending.current = true;
    try {
      const receipt = await mutation.mutateAsync(parsed.data);
      setInput({
        name: '',
        email: '',
        context: 'INITIAL_CONTACT',
        message: empty,
      });
      void showToast({
        title: receipt.demo ? copy.demoTitle : copy.successTitle,
        description: receipt.demo
          ? copy.demoDescription
          : copy.successDescription,
        intent: 'success',
      });
    } catch {
      // Keep the full draft available for retry.
    } finally {
      pending.current = false;
    }
  }
  const validation = (name: keyof ContactRequest) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${formId}-${name}-error` : undefined,
  });
  const errorMessage = (name: keyof ContactRequest) =>
    errors[name] && (
      <p
        id={`${formId}-${name}-error`}
        role="alert"
        className="gp-contact-error"
      >
        {errors[name]}
      </p>
    );

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={(event) => void submit(event)}
      className="gp-contact-form"
      aria-busy={busy}
      aria-label={copy.formLabel}
      aria-describedby={`${formId}-description`}
    >
      <p id={`${formId}-description`} className="gp-contact-guidance">
        {copy.formDescription}
      </p>
      <div className="gp-contact-fields">
        <div>
          <Field labelText={copy.nameLabel}>
            <Input
              name="name"
              autoComplete="name"
              value={input.name}
              maxLength={100}
              disabled={busy}
              {...validation('name')}
              onChange={(event) => update('name', event.target.value)}
            />
          </Field>
          {errorMessage('name')}
        </div>
        <div>
          <Field labelText={copy.emailLabel}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              value={input.email}
              maxLength={254}
              disabled={busy}
              {...validation('email')}
              onChange={(event) => update('email', event.target.value)}
            />
          </Field>
          {errorMessage('email')}
        </div>
        <div className="gp-contact-field-wide">
          <Field labelText={copy.contextLabel}>
            <Select
              name="context"
              value={input.context}
              disabled={busy}
              {...validation('context')}
              onValueChange={(value) =>
                update('context', ContactContextSchema.parse(value))
              }
            >
              {ContactContextSchema.options.map((value) => (
                <option key={value} value={value}>
                  {copy.contexts[value]}
                </option>
              ))}
            </Select>
          </Field>
          {errorMessage('context')}
        </div>
        <div className="gp-contact-field-wide">
          <Field labelText={copy.messageLabel}>
            <TextArea
              name="message"
              value={input.message}
              maxLength={5000}
              disabled={busy}
              {...validation('message')}
              onChange={(event) => update('message', event.target.value)}
            />
          </Field>
          {errorMessage('message')}
        </div>
      </div>
      {mutation.isError && (
        <Message
          intent="danger"
          title={copy.errorTitle}
          description={copy.errorDescription}
        />
      )}
      <div className="gp-contact-actions">
        <Button type="submit" loading={busy} className="gp-button">
          <UiIcon name="mail" />
          {copy.sendAction}
        </Button>
      </div>
    </form>
  );
}
