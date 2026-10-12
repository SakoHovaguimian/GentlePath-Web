'use client';
import { strings } from '@/strings';
import { useState } from 'react';
import {
  Button,
  Card,
  Field,
  Input,
  QueryBoundary,
  Page,
  PageHeader,
  FormActions,
} from '@/components/ui';
import type { User } from '@/models';
import { useSessionState } from '@/providers/AppProviders';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUpdateCurrentUser, useUser } from './hooks';
export function ProfileScreen() {
  const { session } = useSessionState();
  const query = useUser(session?.user.id || '');
  return (
    <Page>
      <PageHeader title={strings.ui.profileScreen.yourProfile} />
      <QueryBoundary query={query}>
        {(user) => <ProfileForm key={user.id} user={user} />}
      </QueryBoundary>
    </Page>
  );
}
function ProfileForm({ user }: { user: User }) {
  const presentation = usePresentationService();
  const mutation = useUpdateCurrentUser(user.id);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user.dateOfBirth?.slice(0, 10) || '',
  );
  return (
    <Card className="grid gap-5">
      <form
        noValidate
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (mutation.isPending) return;
          mutation.mutate(
            {
              firstName,
              lastName,
              email: user.email,
              phoneNumber: phoneNumber || null,
              dateOfBirth: dateOfBirth
                ? new Date(`${dateOfBirth}T00:00:00.000Z`).toISOString()
                : null,
            },
            {
              onSuccess: () => {
                void presentation.showToast({
                  title: strings.ui.profileScreen.profileUpdated,
                  intent: 'success',
                });
              },
            },
          );
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText={strings.ui.profileScreen.firstName}>
            <Input
              value={firstName}
              autoComplete="given-name"
              onChange={(event) => setFirstName(event.target.value)}
            />
          </Field>
          <Field labelText={strings.ui.profileScreen.lastName}>
            <Input
              value={lastName}
              autoComplete="family-name"
              onChange={(event) => setLastName(event.target.value)}
            />
          </Field>
        </div>
        <Field labelText={strings.ui.profileScreen.email}>
          <Input
            type="email"
            value={user.email}
            readOnly
            autoComplete="email"
          />
        </Field>
        <Field labelText={strings.ui.profileScreen.phoneNumber}>
          <Input
            type="tel"
            value={phoneNumber}
            autoComplete="tel"
            onChange={(event) => setPhoneNumber(event.target.value)}
          />
        </Field>
        <Field labelText={strings.ui.profileScreen.dateOfBirth}>
          <Input
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </Field>
        {mutation.isError && (
          <p role="alert" className="text-sm text-error-primary">
            {mutation.error.message}
          </p>
        )}
        <FormActions variant="plain">
          <Button
            loading={mutation.isPending}
            type="submit"
            disabled={
              !firstName.trim() || !lastName.trim() || mutation.isPending
            }
          >
            {strings.ui.profileScreen.saveProfile}
          </Button>
        </FormActions>
      </form>
    </Card>
  );
}
