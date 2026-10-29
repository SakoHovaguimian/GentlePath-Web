'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Field,
  Input,
  PasswordInput,
  Select,
  UiIcon,
} from '@/components/ui';
import { LoginInputSchema, type LoginInput } from '@/models/loginInput';
import { UserRoleSchema, type UserRole } from '@/models/userRole';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import {
  gentlePathAuthStrings as authCopy,
  gentlePathPortalStrings,
  gentlePathAccountToolsStrings as accountCopy,
  strings,
} from '@/strings';
import { AuthCardShell } from './AuthCardShell';
import { authDestination } from './authDestination';
import { LockIcon, MailIcon } from './authIcons';
import { createSession, enableDemoMode } from './sessionClient';

export function LoginScreen({
  redirectTo,
  accountDeleted = false,
}: {
  redirectTo?: string;
  accountDeleted?: boolean;
}) {
  const router = useRouter();
  const { demoMode, devSettingsEnabled } = useRuntimeConfig();
  const [demoRole, setDemoRole] = useState<UserRole>('user');
  const [email, setEmail] = useState(demoMode ? authCopy.demoEmails.user : '');
  const [password, setPassword] = useState(
    demoMode ? authCopy.demoPassword : '',
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginInput, string>>
  >({});
  const [pending, setPending] = useState(false);
  const [restoringDemo, setRestoringDemo] = useState(false);

  async function restoreDemo() {
    if (pending || restoringDemo) return;
    setRestoringDemo(true);
    setError(null);
    try {
      await enableDemoMode();
      window.location.assign('/login');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : authCopy.demoRestoreErrorDescription,
      );
    } finally {
      setRestoringDemo(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (pending || restoringDemo) return;
    setError(null);
    setFieldErrors({});
    const parsed = LoginInputSchema.safeParse({ email, password });
    if (!parsed.success) {
      setFieldErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [issue.path[0], issue.message]),
        ),
      );
      const firstField = String(parsed.error.issues[0]?.path[0] ?? 'email');
      form.querySelector<HTMLInputElement>(`[name="${firstField}"]`)?.focus();
      return;
    }
    setPending(true);
    try {
      const session = await createSession({ action: 'login', ...parsed.data });
      router.push(authDestination(session.user.role, redirectTo));
      router.refresh();
    } catch (caughtError) {
      form.querySelector('input')?.focus();
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : strings.ui.loginScreen.loginFailed,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCardShell
      badge={gentlePathPortalStrings.auth.eyebrow}
      title={gentlePathPortalStrings.auth.title}
      description={gentlePathPortalStrings.auth.description}
      footerPrompt={strings.ui.loginScreen.needAnAccount}
      footerHref={
        redirectTo
          ? `/signup?redirectTo=${encodeURIComponent(redirectTo)}`
          : '/signup'
      }
      footerAction={strings.ui.loginScreen.createAccount}
      mockHint={demoMode ? gentlePathPortalStrings.auth.demoHint : undefined}
    >
      {accountDeleted && (
        <Card role="status" className="grid gap-2 bg-secondary_subtle">
          <h2 className="m-0 text-base font-semibold text-primary">
            {accountCopy.account.completedTitle}
          </h2>
          <p className="m-0 text-sm text-secondary">
            {accountCopy.account.completedDescription}
          </p>
        </Card>
      )}
      <form noValidate onSubmit={handleSubmit} className="gp-auth-form">
        {demoMode ? (
          <div className="gp-auth-demo-role">
            <Field labelText={gentlePathPortalStrings.auth.demoRoleLabel}>
              <Select
                value={demoRole}
                disabled={pending}
                aria-describedby="gentlepath-auth-demo-hint"
                leadingIcon={<UiIcon name="user" />}
                onValueChange={(value) => {
                  const role = UserRoleSchema.safeParse(value);
                  if (!role.success) return;
                  setDemoRole(role.data);
                  setEmail(authCopy.demoEmails[role.data]);
                  setPassword(authCopy.demoPassword);
                  setError(null);
                  setFieldErrors({});
                }}
              >
                {Object.entries(gentlePathPortalStrings.auth.demoRoles).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </Select>
            </Field>
          </div>
        ) : null}
        <div>
          <Field labelText={strings.ui.loginScreen.email}>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              placeholder={authCopy.emailPlaceholder}
              leadingIcon={<MailIcon className="size-5" />}
              value={email}
              aria-invalid={Boolean(fieldErrors.email || error)}
              aria-describedby={
                fieldErrors.email
                  ? 'gentlepath-login-email-error'
                  : error
                    ? 'gentlepath-login-error'
                    : undefined
              }
              disabled={pending}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          {fieldErrors.email ? (
            <p
              className="gp-auth-field-error"
              id="gentlepath-login-email-error"
            >
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div>
          <Field labelText={strings.ui.loginScreen.password}>
            <PasswordInput
              name="password"
              autoComplete="current-password"
              placeholder={strings.ui.loginScreen.enterYourPassword}
              leadingIcon={<LockIcon className="size-5" />}
              value={password}
              aria-invalid={Boolean(fieldErrors.password || error)}
              aria-describedby={
                fieldErrors.password
                  ? 'gentlepath-login-password-error'
                  : error
                    ? 'gentlepath-login-error'
                    : undefined
              }
              disabled={pending}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {fieldErrors.password ? (
            <p
              className="gp-auth-field-error"
              id="gentlepath-login-password-error"
            >
              {fieldErrors.password}
            </p>
          ) : null}
        </div>
        {error ? (
          <p id="gentlepath-login-error" role="alert" className="gp-auth-error">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          loading={pending}
          disabled={restoringDemo}
          className="gp-auth-submit"
        >
          {strings.ui.loginScreen.signIn}
          <UiIcon name="arrowRight" />
        </Button>
        {!demoMode && devSettingsEnabled ? (
          <Button
            variant="secondary"
            onClick={restoreDemo}
            loading={restoringDemo}
            disabled={pending}
          >
            {authCopy.restoreDemoAction}
          </Button>
        ) : null}
      </form>
    </AuthCardShell>
  );
}
