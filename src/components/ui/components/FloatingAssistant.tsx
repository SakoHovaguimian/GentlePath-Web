'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { useFloatingAssistantContext } from '../lib/floatingAssistantContext';
import { FloatingAssistantDialog } from './FloatingAssistantDialog';

interface FloatingAssistantActionProps {
  id: string;
  title: string;
  description: string;
  disabled: boolean;
  onOpen?: () => void;
}

export function FloatingAssistantAction({
  id,
  title,
  description,
  disabled,
  onOpen,
}: FloatingAssistantActionProps) {
  const { register, unregister } = useFloatingAssistantContext();
  const action = useRef(onOpen);
  useLayoutEffect(() => {
    action.current = onOpen;
  }, [onOpen]);
  const external = Boolean(onOpen);
  useEffect(() => {
    register({
      id,
      title,
      description,
      disabled,
      ...(external ? { onOpen: () => action.current?.() } : {}),
    });
  }, [id, title, description, disabled, external, register]);
  useEffect(() => () => unregister(id), [id, unregister]);
  return null;
}

export function FloatingAssistant({
  id,
  title,
  description,
  disabled,
  busy,
  children,
}: {
  id: string;
  title: string;
  description: string;
  disabled: boolean;
  busy: boolean;
  children: ReactNode;
}) {
  const { activeId, close, focusLauncher } = useFloatingAssistantContext();
  return (
    <>
      <FloatingAssistantAction
        id={id}
        title={title}
        description={description}
        disabled={disabled}
      />
      <FloatingAssistantDialog
        open={activeId === id}
        title={title}
        description={description}
        busy={busy}
        onClose={close}
        onReturnFocus={focusLauncher}
      >
        {children}
      </FloatingAssistantDialog>
    </>
  );
}
