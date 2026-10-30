'use client';
import { useRef, useState } from 'react';
import {
  Card,
  Field,
  Input,
  FormActions,
  BookmarkButton,
} from '@/components/ui';
import type { User } from '@/models';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { strings } from '@/strings';
import { useUpdateCurrentUser } from '../hooks';

export function ProfileForm({ user }: { user: User }) {
  const presentation = usePresentationService();
  const mutation = useUpdateCurrentUser(user.id);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user.dateOfBirth?.slice(0, 10) || '',
  );
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  function edited() {
    dirty.current = true;
    mutation.reset();
  }
  return (
    <Card className="grid gap-5">
      <form
        noValidate
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (busy.current) return;
          busy.current = true;
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
                dirty.current = false;
                void presentation.showToast({
                  title: strings.ui.profileScreen.profileUpdated,
                  intent: 'success',
                });
              },
              onSettled: () => {
                busy.current = false;
              },
            },
          );
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field labelText={strings.ui.profileScreen.firstName}>
            <Input
              disabled={mutation.isPending}
              value={firstName}
              autoComplete="given-name"
              onChange={(event) => {
                edited();
                setFirstName(event.target.value);
              }}
            />
          </Field>
          <Field labelText={strings.ui.profileScreen.lastName}>
            <Input
              disabled={mutation.isPending}
              value={lastName}
              autoComplete="family-name"
              onChange={(event) => {
                edited();
                setLastName(event.target.value);
              }}
            />
          </Field>
        </div>
        <Field labelText={strings.ui.profileScreen.email}>
          <Input
            disabled={mutation.isPending}
            type="email"
            value={user.email}
            readOnly
            autoComplete="email"
          />
        </Field>
        <Field labelText={strings.ui.profileScreen.phoneNumber}>
          <Input
            disabled={mutation.isPending}
            type="tel"
            value={phoneNumber}
            autoComplete="tel"
            onChange={(event) => {
              edited();
              setPhoneNumber(event.target.value);
            }}
          />
        </Field>
        <Field labelText={strings.ui.profileScreen.dateOfBirth}>
          <Input
            disabled={mutation.isPending}
            type="date"
            value={dateOfBirth}
            onChange={(event) => {
              edited();
              setDateOfBirth(event.target.value);
            }}
          />
        </Field>
        {mutation.isError && (
          <p role="alert" className="text-sm text-error-primary">
            {mutation.error.message}
          </p>
        )}
        <FormActions variant="plain">
          <BookmarkButton
            saved={mutation.isSuccess}
            loading={mutation.isPending}
            type="submit"
            disabled={
              !firstName.trim() || !lastName.trim() || mutation.isPending
            }
          >
            {strings.ui.profileScreen.saveProfile}
          </BookmarkButton>
        </FormActions>
      </form>
    </Card>
  );
}
