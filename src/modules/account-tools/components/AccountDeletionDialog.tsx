import { useRef, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ConfirmationChoice,
  Field,
  Input,
  Modal,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { useRealtime } from '@/services/realtime/RealtimeProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { useDeleteAccount } from '../hooks';

export function AccountDeletionDialog({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [validation, setValidation] = useState('');
  const dirty = useRef(false);
  const busy = useRef(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const confirmLeave = useUnsavedFormGuard(dirty, busy);
  const deletion = useDeleteAccount();
  const cache = useQueryClient();
  const realtime = useRealtime();
  const { setSession } = useSessionState();
  function close() {
    void confirmLeave().then((allowed) => {
      if (allowed) onClose();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    if (confirmationEmail !== email || !acknowledged) {
      setValidation(copy.account.confirmationRequiredDescription);
      emailRef.current?.focus();
      return;
    }
    busy.current = true;
    setValidation('');
    try {
      await deletion.mutateAsync({ confirmationEmail });
      // Stop external listeners while the mounted screen still has its session,
      // then make the cache/session transition and hard navigation together.
      await realtime
        .prepareForLogout({ accountDeleted: true })
        .catch(() => undefined);
      await cache.cancelQueries();
      dirty.current = false;
      busy.current = false;
      cache.clear();
      setSession(null);
      window.location.replace('/login?accountDeleted=1');
    } catch {
      // Preserve the typed confirmation and acknowledgement for a safe retry.
      busy.current = false;
    }
  }
  return (
    <Modal
      open
      title={copy.account.confirmationTitle}
      description={copy.account.confirmationDescription(email)}
      onDismiss={close}
      initialFocusRef={cancelRef}
    >
      <form noValidate onSubmit={submit} className="grid gap-5">
        <Field labelText={copy.account.confirmationEmailLabel}>
          <Input
            ref={emailRef}
            name="confirmationEmail"
            type="email"
            autoComplete="off"
            value={confirmationEmail}
            placeholder={copy.account.confirmationPlaceholder}
            disabled={deletion.isPending}
            aria-invalid={Boolean(validation)}
            aria-describedby={
              validation
                ? 'account-deletion-hint account-deletion-validation'
                : 'account-deletion-hint'
            }
            onChange={(event) => {
              setConfirmationEmail(event.target.value);
              dirty.current = Boolean(event.target.value || acknowledged);
              setValidation('');
              deletion.reset();
            }}
          />
        </Field>
        <p id="account-deletion-hint" className="m-0 text-sm text-secondary">
          {copy.account.confirmationHint}
        </p>
        <ConfirmationChoice
          label={copy.account.confirmationAcknowledgement}
          description={copy.account.confirmationAcknowledgementDescription}
          checked={acknowledged}
          disabled={deletion.isPending}
          onChange={(event) => {
            setAcknowledged(event.target.checked);
            dirty.current = Boolean(confirmationEmail || event.target.checked);
            setValidation('');
          }}
        />
        {validation && (
          <p
            id="account-deletion-validation"
            role="alert"
            className="m-0 text-sm text-error-primary"
          >
            {validation}
          </p>
        )}
        <MutationError error={deletion.error} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-secondary pt-5">
          <Button
            ref={cancelRef}
            variant="secondary"
            disabled={deletion.isPending}
            onClick={close}
          >
            {copy.common.cancelAction}
          </Button>
          <Button
            type="submit"
            variant="destructive"
            loading={deletion.isPending}
            disabled={confirmationEmail !== email || !acknowledged}
          >
            {copy.account.deleteAction}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
