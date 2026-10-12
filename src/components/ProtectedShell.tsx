'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { AppSession } from '@/models';
import { AppShell } from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { ThemeToggle } from '@/modules/settings/components/ThemeToggle';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { ShellActions } from '@/components/ShellActions';

export function ProtectedShell({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AppSession;
}) {
  const navigate = useGuardedNavigate();
  const pathname = usePathname();
  const { session } = useSessionState();

  return (
    <AppShell
      session={session ?? initialSession}
      accountSlot={<ShellActions />}
      utilitySlot={<ThemeToggle />}
      activePath={pathname}
      onNavigate={(href) => {
        if (href !== pathname) {
          void navigate(href);
        }
      }}
    >
      {children}
    </AppShell>
  );
}
