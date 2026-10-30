'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { AppSession } from '@/models';
import { AppShell, Badge } from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { ThemeToggle } from '@/modules/settings/components/ThemeToggle';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { ShellActions } from '@/components/ShellActions';
import { GentlePathBrand } from '@/components/GentlePathBrand';
import { gentlePathPortalStrings as copy } from '@/strings';
import { portalNavigation } from '@/modules/portal/portalNavigation';
import { NotificationInboxLink } from '@/modules/notification-inbox/components/NotificationInboxLink';
import { NotificationTimezoneSync } from '@/modules/notification-inbox/components/NotificationTimezoneSync';

export function ProtectedShell({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: AppSession;
}) {
  const { confirmNavigation } = useNavigationGuard();
  const pathname = usePathname();
  const { session } = useSessionState();
  const current = session ?? initialSession;
  const adminArea =
    pathname.startsWith('/admin') || pathname.startsWith('/superadmin');

  return (
    <>
      <NotificationTimezoneSync />
      <AppShell
        session={current}
        accountSlot={<ShellActions />}
        utilitySlot={
          <>
            <span className="hidden sm:inline-flex">
              <Badge>{copy.navigation.role[current.user.role]}</Badge>
            </span>
            <NotificationInboxLink />
            <ThemeToggle />
          </>
        }
        navigationItems={portalNavigation(current.user.role, adminArea)}
        workspaceLabel={
          adminArea ? copy.navigation.adminWorkspace : copy.navigation.workspace
        }
        brandSlot={<GentlePathBrand />}
        navigationLabel={
          adminArea ? copy.navigation.adminGroup : copy.navigation.familyGroup
        }
        activePath={pathname}
        onBeforeNavigate={confirmNavigation}
      >
        {children}
      </AppShell>
    </>
  );
}
