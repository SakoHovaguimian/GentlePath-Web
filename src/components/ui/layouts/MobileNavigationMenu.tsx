'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { strings } from '@/strings';
import { IconButton } from '../components/IconButton';
import { UiIcon } from '../components/UiIcon';
import type { AppSidebarProps } from '../models/appSidebarProps';
import { AppSidebarContent } from './AppSidebarContent';

export function MobileNavigationMenu(props: AppSidebarProps) {
  const [open, setOpen] = useState(false);
  const copy = strings.ui.appShell;
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)');
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', onResize);
    return () => desktop.removeEventListener('change', onResize);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconButton
          label={copy.openNavigation}
          variant="ghost"
          className="lg:hidden"
        >
          <UiIcon name="menu" className="size-6" />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="ui-backdrop fixed inset-0 z-60 bg-(--dashboard-shell-overlay) lg:hidden" />
        <Dialog.Content
          aria-describedby={undefined}
          data-side="left"
          className="ui-sheet ui-mobile-navigation fixed inset-0 z-70 h-dvh w-full overflow-hidden overscroll-y-contain bg-(--dashboard-sidebar-bg) outline-none lg:hidden"
          onCloseAutoFocus={(event) => {
            if (window.matchMedia('(min-width: 64rem)').matches) {
              event.preventDefault();
              document
                .getElementById('main-content')
                ?.focus({ preventScroll: true });
            }
          }}
          onClickCapture={(event) => {
            if (
              event.button === 0 &&
              !event.metaKey &&
              !event.ctrlKey &&
              !event.shiftKey &&
              !event.altKey &&
              event.target instanceof Element &&
              event.target.closest('a[href]')
            )
              setOpen(false);
          }}
        >
          <Dialog.Title className="sr-only">{copy.navigation}</Dialog.Title>
          <AppSidebarContent
            {...props}
            onNavigate={(href) => {
              setOpen(false);
              if (props.onNavigate) props.onNavigate(href);
              else window.location.assign(href);
            }}
            headerAction={
              <Dialog.Close asChild>
                <IconButton label={copy.closeNavigation} variant="ghost">
                  <UiIcon name="close" className="size-6" />
                </IconButton>
              </Dialog.Close>
            }
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
