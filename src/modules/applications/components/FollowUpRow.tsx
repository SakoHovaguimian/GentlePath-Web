'use client';

import { useRef, useState } from 'react';
import { Badge, Button, IconMenu, NavigationLink } from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathApplicationStrings as copy } from '@/strings';
import type { ApplicationFollowUp } from '../models/applicationFollowUp';
import { useApplicationMutations } from '../hooks';
import { FollowUpEditor } from './FollowUpEditor';
import { useChildren } from '@/modules/portal/hooks';

export function FollowUpRow({
  followUp,
  priority = false,
}: {
  followUp: ApplicationFollowUp;
  priority?: boolean;
}) {
  const { completeFollowUp, deleteFollowUp } = useApplicationMutations();
  const children = useChildren();
  const childName = children.data?.find(
    (child) => child.id === followUp.child_id,
  )?.name;
  const [editing, setEditing] = useState(false);
  const busy = useRef(false);
  const { showAlert, showToast } = usePresentationService();
  async function complete() {
    if (busy.current) return;
    busy.current = true;
    try {
      await completeFollowUp.mutateAsync({
        id: followUp.application_id,
        followUpId: followUp.id,
        input: {
          completed: !followUp.completed_at,
          expected_updated_at: followUp.updated_at!,
        },
      });
      void showToast({
        title: followUp.completed_at ? copy.reopenedTitle : copy.completedTitle,
        intent: 'success',
      });
    } catch {
      // Retain the row and show a safe inline error.
    } finally {
      busy.current = false;
    }
  }
  async function remove() {
    if (busy.current) return;
    busy.current = true;
    try {
      if (
        !(await showAlert({
          title: copy.followUpDeleteTitle,
          description: copy.followUpDeleteDescription,
          tone: 'danger',
          confirmLabel: copy.followUpDelete,
          cancelLabel: copy.cancelAction,
        }))
      )
        return;
      await deleteFollowUp.mutateAsync({
        id: followUp.application_id,
        followUpId: followUp.id,
      });
      void showToast({ title: copy.followUpDeleted, intent: 'success' });
    } catch {
      // Preserve a failed deletion for retry.
    } finally {
      busy.current = false;
    }
  }
  const pending = completeFollowUp.isPending || deleteFollowUp.isPending;
  return (
    <div className="grid gap-3 border-b border-secondary py-4 last:border-0 last:pb-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid min-w-0 flex-1 gap-2">
          {priority && (
            <NavigationLink
              href={`/applications/${followUp.application_id}`}
              className="font-medium text-primary hover:underline wrap-anywhere"
            >
              {followUp.application_title}
            </NavigationLink>
          )}
          {priority && childName && (
            <span className="text-sm text-secondary">{childName}</span>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              intent={
                followUp.completed_at
                  ? 'neutral'
                  : (followUp.days_until_due ?? 0) < 0
                    ? 'warning'
                    : 'brand'
              }
            >
              {followUp.completed_at
                ? copy.completedLabel
                : copy.dueDescription(followUp.days_until_due ?? 0)}
            </Badge>
            <span className="text-xs text-tertiary">
              {copy.dateDescription(followUp.due_on)}
            </span>
          </div>
          {followUp.notes && (
            <p className="m-0 whitespace-pre-wrap text-sm text-secondary wrap-anywhere">
              {followUp.notes}
            </p>
          )}
        </div>
        {!priority && (
          <IconMenu
            label={copy.followUpsTitle}
            disabled={pending}
            items={[
              { id: 'edit', label: copy.followUpEdit, icon: 'file' },
              {
                id: 'delete',
                label: copy.followUpDelete,
                icon: 'trash',
                variant: 'destructive',
              },
            ]}
            onAction={(action) =>
              action === 'edit' ? setEditing(true) : void remove()
            }
          />
        )}
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {priority && (
          <Button asChild variant="secondary">
            <NavigationLink href={`/applications/${followUp.application_id}`}>
              {copy.viewAction}
            </NavigationLink>
          </Button>
        )}
        <Button
          variant={followUp.completed_at ? 'secondary' : 'primary'}
          loading={completeFollowUp.isPending}
          disabled={deleteFollowUp.isPending}
          onClick={() => void complete()}
        >
          {followUp.completed_at ? copy.reopenAction : copy.completeAction}
        </Button>
      </div>
      <MutationError error={completeFollowUp.error} />
      <MutationError error={deleteFollowUp.error} />
      {editing && (
        <FollowUpEditor
          applicationId={followUp.application_id}
          followUp={followUp}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
