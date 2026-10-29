'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { UNSAFE_PortalProvider } from 'react-aria/PortalProvider';
import { useRef, type ReactNode, type RefObject } from 'react';
import { strings } from '@/strings';
import { IconButton } from './IconButton';
import { UiIcon } from './UiIcon';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  onDismiss: () => void;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
}

// Workflow dialogs sit below presentation confirmations so an existing guarded
// form can request confirmation without losing its draft or focus scope.
export function Modal({
  open,
  title,
  description,
  icon,
  onDismiss,
  children,
  initialFocusRef,
}: ModalProps) {
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const overlaysRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnotherOverlay = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false;
    const layer = target.closest(
      '[data-ui-presentation-layer], [role="dialog"], [role="alertdialog"]',
    );
    return Boolean(
      layer &&
      layer !== contentRef.current &&
      !contentRef.current?.contains(layer),
    );
  };
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onDismiss();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="ui-backdrop fixed inset-0 z-60 bg-(--dashboard-shell-overlay) backdrop-blur-sm" />
        <Dialog.Content
          ref={contentRef}
          className="ui-dialog fixed top-1/2 left-1/2 z-70 flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-2rem)] w-[min(calc(100vw-2rem),44rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-secondary bg-primary shadow-(--dashboard-shell-shadow-lg) outline-none"
          {...(!description ? { 'aria-describedby': undefined } : {})}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            (initialFocusRef?.current ?? titleRef.current)?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (returnFocusRef.current?.isConnected)
              returnFocusRef.current.focus();
          }}
          onEscapeKeyDown={(event) => {
            if (isAnotherOverlay(event.target)) return;
            event.preventDefault();
            // Radix observes Escape in document capture before React Aria can
            // close a child popup. Let that popup consume the first Escape.
            if (
              event.target instanceof Node &&
              overlaysRef.current?.contains(event.target)
            )
              return;
            onDismiss();
          }}
          onInteractOutside={(event) => {
            event.preventDefault();
            if (isAnotherOverlay(event.detail.originalEvent.target)) return;
            onDismiss();
          }}
        >
          <div className="flex shrink-0 items-start gap-4 border-b border-secondary p-5 sm:p-6">
            {icon && (
              <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl border border-secondary bg-secondary_subtle text-secondary">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <Dialog.Title
                ref={titleRef}
                tabIndex={-1}
                className="m-0 text-xl font-semibold text-primary outline-none"
              >
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="m-0 mt-2 text-sm text-secondary">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <IconButton
              label={strings.ui.modal.close}
              variant="ghost"
              onClick={onDismiss}
            >
              <UiIcon name="close" />
            </IconButton>
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <UNSAFE_PortalProvider getContainer={() => overlaysRef.current}>
              {children}
            </UNSAFE_PortalProvider>
          </div>
          <div ref={overlaysRef} className="contents" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
