import { useState } from 'react';
import {
  Button,
  BookmarkButton,
  Field,
  InitialsAvatar,
  Modal,
  Select,
  Switch,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { UserRoleSchema } from '@/models/userRole';
import { ManagedUserRoleSchema } from '../models/managedUserRole';
import {
  canManageContent,
  canManagePlatform,
} from '@/services/auth/permissions';
import { gentlePathPortalStrings as copy } from '@/strings';
import type { ManagedUser } from '../models/managedUser';
import { useUpdateManagedUser } from '../adminHooks';
import { MutationError } from './MutationError';
import styles from '../Admin.module.css';

export function ManagedUserEditor({
  user,
  onClose,
}: {
  user: ManagedUser;
  onClose: () => void;
}) {
  const [role, setRole] = useState(user.role);
  const [enabled, setEnabled] = useState(!user.disabled);
  const restrictsAccess =
    (!enabled && !user.disabled) ||
    (canManageContent(UserRoleSchema.safeParse(user.role).data ?? 'user') &&
      !canManageContent(UserRoleSchema.safeParse(role).data ?? 'user')) ||
    (canManagePlatform(UserRoleSchema.safeParse(user.role).data ?? 'user') &&
      !canManagePlatform(UserRoleSchema.safeParse(role).data ?? 'user'));
  const mutation = useUpdateManagedUser();
  const { showAlert, showToast } = usePresentationService();
  return (
    <Modal
      open
      title={copy.people.editTitle}
      description={copy.people.editDescription}
      onDismiss={() => {
        if (!mutation.isPending) onClose();
      }}
    >
      <form
        noValidate
        className="grid gap-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (
            mutation.isPending ||
            !(await showAlert({
              title: copy.people.confirmTitle,
              description: copy.people.confirmDescription,
              tone: restrictsAccess ? 'danger' : 'info',
              confirmLabel: copy.people.confirmAction,
              cancelLabel: copy.common.cancel,
            }))
          )
            return;
          try {
            await mutation.mutateAsync({
              id: user.id,
              input: {
                ...(UserRoleSchema.safeParse(role).success
                  ? { role: UserRoleSchema.parse(role) }
                  : {}),
                disabled: !enabled,
              },
            });
            void showToast({ title: copy.people.updated, intent: 'success' });
            onClose();
          } catch {
            /* Inline error. */
          }
        }}
      >
        <div className={styles.editorIdentity}>
          <InitialsAvatar
            name={copy.common.personName(user.firstName, user.lastName)}
          />
          <p>
            {copy.common.personName(user.firstName, user.lastName)}
            <br />
            {user.email}
          </p>
        </div>
        <Field labelText={copy.people.role}>
          <Select
            value={role}
            onValueChange={(value) =>
              setRole(ManagedUserRoleSchema.parse(value))
            }
            disabled={mutation.isPending}
          >
            {!UserRoleSchema.safeParse(user.role).success && (
              <option value={user.role} disabled>
                {copy.people.roles[user.role]}
              </option>
            )}
            {Object.entries(copy.navigation.role).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Switch
          label={copy.people.enabledLabel}
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          disabled={mutation.isPending}
        />
        <MutationError error={mutation.error} />
        <div className="flex justify-end gap-3 border-t border-secondary pt-5">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            {copy.common.cancel}
          </Button>
          <BookmarkButton
            type="submit"
            loading={mutation.isPending}
            disabled={role === user.role && enabled === !user.disabled}
          >
            {copy.people.save}
          </BookmarkButton>
        </div>
      </form>
    </Modal>
  );
}
