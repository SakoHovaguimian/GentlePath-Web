'use client';
import { useCallback, useEffect, type RefObject } from 'react';
import { useNavigationGuard } from './NavigationGuardProvider';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';

async function confirmFormLeave(
  dirty: RefObject<boolean>,
  busy: RefObject<boolean>,
  confirmDiscard: () => Promise<boolean>,
) {
  if (busy.current) return false;
  if (!dirty.current) return true;
  return confirmDiscard();
}

export function useUnsavedFormGuard(
  dirty: RefObject<boolean>,
  busy: RefObject<boolean>,
  description: string = strings.common.unsavedDescription,
) {
  const { register } = useNavigationGuard();
  const { showAlert } = usePresentationService();
  const confirmLeave = useCallback(
    () =>
      confirmFormLeave(dirty, busy, () =>
        showAlert({
          title: strings.common.unsavedTitle,
          description,
          tone: 'warning',
          confirmLabel: strings.common.discardChanges,
          cancelLabel: strings.common.keepEditing,
        }),
      ),
    [busy, dirty, showAlert, description],
  );
  useEffect(() => {
    const unregister = register(confirmLeave);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty.current && !busy.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      unregister();
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [register, confirmLeave, dirty, busy]);
  return confirmLeave;
}
