'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { AppSession } from '@/models';
import { AppShell, Badge } from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { ThemeToggle } from '@/modules/settings/components/ThemeToggle';
import { useGuardedNavigate } from '@/providers/useGuardedNavigate';
import { ShellActions } from '@/components/ShellActions';
import { GentlePathBrand } from '@/components/GentlePathBrand';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { portalNavigation } from '@/modules/portal/portalNavigation';

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
  const runtime = useRuntimeConfig();
  const current = session ?? initialSession;
  const adminArea =
    pathname.startsWith('/admin') || pathname.startsWith('/superadmin');

  return (
    <AppShell
      session={current}
      accountSlot={<ShellActions />}
      utilitySlot={
        <>
          <span className="hidden sm:inline-flex">
            <Badge>{copy.navigation.role[current.user.role]}</Badge>
          </span>
          <ThemeToggle />
        </>
      }
      navigationItems={portalNavigation(
        current.user.role,
        adminArea,
        Boolean(runtime.devSettingsEnabled),
      )}
      workspaceLabel={
        adminArea ? copy.navigation.adminWorkspace : copy.navigation.workspace
      }
      brandSlot={<GentlePathBrand />}
      bannerSlot={
        runtime.demoMode ? (
          <p className="m-0 flex flex-wrap items-center gap-2 text-xs text-tertiary">
            <Badge>{copy.navigation.demo}</Badge>
            {copy.navigation.demoHint}
          </p>
        ) : undefined
      }
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
