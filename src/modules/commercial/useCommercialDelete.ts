'use client';

import { useRef } from 'react';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { commercialName } from './components/commercialFormFields';
import { useCommercialMutation } from './hooks';
import type { CommercialDeleteOptions } from './models/commercialDeleteOptions';

export function useCommercialDelete({
  entity,
  record,
  dirty: dirtyRef,
  busy: busyRef,
  onDeleted,
}: CommercialDeleteOptions) {
  const { showAlert, showToast } = usePresentationService();
  const { confirmNavigation } = useNavigationGuard();
  const confirming = useRef(false);
  const mutation = useCommercialMutation((service, id: string) =>
    service.remove(entity, id),
  );

  async function destroy() {
    if (!record || busyRef.current || confirming.current) return;
    confirming.current = true;
    let ownsBusy = false;
    try {
      if (!(await confirmNavigation())) return;
      if (
        !(await showAlert({
          title: copy.deleteTitle,
          description: copy.deleteDescription(commercialName(record)),
          confirmLabel: copy.delete,
          cancelLabel: copy.cancel,
          tone: 'danger',
        }))
      )
        return;
      if (busyRef.current) return;
      busyRef.current = true;
      ownsBusy = true;
      await mutation.mutateAsync(record.id);
      dirtyRef.current = false;
      void showToast({ title: copy.deletedTitle, intent: 'success' });
      busyRef.current = false;
      onDeleted();
    } catch {
      /* Keep the editor and surface the mutation error. */
    } finally {
      if (ownsBusy) busyRef.current = false;
      confirming.current = false;
    }
  }

  return { destroy, isPending: mutation.isPending, error: mutation.error };
}
