'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input, PasswordInput, UiIcon } from '@/components/ui';
import { SignupInputSchema, type SignupInput } from '@/models/signupInput';
import {
  gentlePathAuthStrings as authCopy,
  gentlePathPortalStrings,
  strings,
} from '@/strings';
import { AuthCardShell } from './AuthCardShell';
import { authDestination } from './authDestination';
import { LockIcon, MailIcon } from './authIcons';
import { createSession } from './sessionClient';

export function SignupScreen({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignupInput, string>>
  >({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (pending) return;
    setError(null);
    setFieldErrors({});
    const parsed = SignupInputSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
    });
    if (!parsed.success) {
      setFieldErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
        ),
      );
      const firstField = String(parsed.error.issues[0]?.path[0] ?? 'firstName');
      form.querySelector<HTMLInputElement>(`[name="${firstField}"]`)?.focus();
      return;
    }
    setPending(true);
    try {
      const session = await createSession({ action: 'signup', ...parsed.data });
      router.push(authDestination(session.user.role, redirectTo));
      router.refresh();
    } catch (caughtError) {
      form.querySelector('input')?.focus();
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : strings.ui.signupScreen.unableToCreateAccount,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCardShell
      badge={gentlePathPortalStrings.auth.eyebrow}
      title={gentlePathPortalStrings.auth.signupTitle}
      description={gentlePathPortalStrings.auth.signupDescription}
      footerPrompt={strings.ui.signupScreen.alreadyHaveAnAccount}
      footerHref={
        redirectTo
          ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
          : '/login'
      }
      footerAction={strings.ui.loginScreen.signIn}
      variant="signup"
    >
      <form noValidate onSubmit={handleSubmit} className="gp-auth-form">
        <div className="gp-auth-name-fields">
          <div>
            <Field labelText={strings.ui.signupScreen.firstName}>
              <Input
                name="firstName"
                autoComplete="given-name"
                placeholder={authCopy.firstNamePlaceholder}
                value={firstName}
                aria-invalid={Boolean(fieldErrors.firstName)}
                aria-describedby={
                  fieldErrors.firstName
                    ? 'gentlepath-signup-first-name-error'
                    : undefined
                }
                disabled={pending}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </Field>
            {fieldErrors.firstName ? (
              <p
                className="gp-auth-field-error"
                id="gentlepath-signup-first-name-error"
              >
                {fieldErrors.firstName}
              </p>
            ) : null}
          </div>
          <div>
            <Field labelText={strings.ui.signupScreen.lastName}>
              <Input
                name="lastName"
                autoComplete="family-name"
                placeholder={authCopy.lastNamePlaceholder}
                value={lastName}
                aria-invalid={Boolean(fieldErrors.lastName)}
                aria-describedby={
                  fieldErrors.lastName
                    ? 'gentlepath-signup-last-name-error'
                    : undefined
                }
                disabled={pending}
                onChange={(event) => setLastName(event.target.value)}
              />
            </Field>
            {fieldErrors.lastName ? (
              <p
                className="gp-auth-field-error"
                id="gentlepath-signup-last-name-error"
              >
                {fieldErrors.lastName}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <Field labelText={strings.ui.signupScreen.email}>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder={authCopy.emailPlaceholder}
              leadingIcon={<MailIcon className="size-5" />}
              value={email}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={
                fieldErrors.email ? 'gentlepath-signup-email-error' : undefined
              }
              disabled={pending}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          {fieldErrors.email ? (
            <p
              className="gp-auth-field-error"
              id="gentlepath-signup-email-error"
            >
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div>
          <Field labelText={strings.ui.signupScreen.password}>
            <PasswordInput
              name="password"
              autoComplete="new-password"
              placeholder={strings.ui.signupScreen.atLeast8Characters}
              leadingIcon={<LockIcon className="size-5" />}
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={
                fieldErrors.password
                  ? 'gentlepath-signup-password-error gentlepath-password-hint'
                  : 'gentlepath-password-hint'
              }
              disabled={pending}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          <p id="gentlepath-password-hint" className="gp-auth-field-hint">
            {authCopy.passwordHint}
          </p>
          {fieldErrors.password ? (
            <p
              className="gp-auth-field-error"
              id="gentlepath-signup-password-error"
            >
              {fieldErrors.password}
            </p>
          ) : null}
        </div>
        {error ? (
          <p
            id="gentlepath-signup-error"
            role="alert"
            className="gp-auth-error"
          >
            {error}
          </p>
        ) : null}
        <Button type="submit" loading={pending} className="gp-auth-submit">
          {strings.ui.signupScreen.createAccount}
          <UiIcon name="arrowRight" />
        </Button>
      </form>
    </AuthCardShell>
  );
}
