'use client';
import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { useNavigationGuard } from './NavigationGuardProvider';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';

function confirmFormLeave(
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
  const pendingConfirmation = useRef<Promise<boolean> | null>(null);
  const confirmLeave = useCallback(
    () =>
      confirmFormLeave(dirty, busy, () => {
        if (pendingConfirmation.current) return pendingConfirmation.current;
        const confirmation = showAlert({
          title: strings.common.unsavedTitle,
          description,
          tone: 'danger',
          confirmLabel: strings.common.discardChanges,
          cancelLabel: strings.common.keepEditing,
        });
        pendingConfirmation.current = confirmation;
        void confirmation.finally(() => {
          if (pendingConfirmation.current === confirmation)
            pendingConfirmation.current = null;
        });
        return confirmation;
      }),
    [busy, dirty, showAlert, description],
  );
  // Dialog dismissal callers retain the asynchronous API; the registered
  // guard remains synchronous for clean browser-link navigation.
  const requestLeave = useCallback(
    () => Promise.resolve(confirmLeave()),
    [confirmLeave],
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
  return requestLeave;
}
