'use client';

import { useRef, type ReactNode } from 'react';
import { usePresentationService } from '@/presentation/PresentationProvider';
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
  const { showAlert } = usePresentationService();
  const exitPrompt = useRef<Promise<boolean> | null>(null);
  const pathname = usePathname();
  const { session } = useSessionState();
  const current = session ?? initialSession;
  const adminArea =
    pathname.startsWith('/admin') || pathname.startsWith('/superadmin');

  function beforeNavigate(href: string) {
    const allowed = confirmNavigation();
    if (!adminArea || href !== '/dashboard') return allowed;
    const confirmExit = () => {
      if (!exitPrompt.current) {
        const prompt = showAlert({
          title: copy.navigation.leaveAdminTitle,
          description: copy.navigation.leaveAdminDescription,
          tone: 'warning',
          confirmLabel: copy.navigation.leaveAdminAction,
          cancelLabel: copy.navigation.stayInAdminAction,
        });
        exitPrompt.current = prompt;
        void prompt.finally(() => {
          exitPrompt.current = null;
        });
      }
      return exitPrompt.current;
    };
    return typeof allowed === 'boolean'
      ? allowed && confirmExit()
      : allowed.then((result) => (result ? confirmExit() : false));
  }

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
        onBeforeNavigate={beforeNavigate}
      >
        {children}
      </AppShell>
    </>
  );
}
