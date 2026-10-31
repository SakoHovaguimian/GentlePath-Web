'use client';

import { NavigationLink } from '@/components/ui/components/NavigationLink';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { useState } from 'react';
import { Button, SectionStack, SplitSection, UiIcon } from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { canManagePlatform } from '@/services/auth/permissions';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { AccountDeletionDialog } from './AccountDeletionDialog';
import './accountSettings.css';

export function AccountSettings() {
  const { session } = useSessionState();
  const { confirmNavigation } = useNavigationGuard();
  const runtime = useRuntimeConfig();
  const [deleting, setDeleting] = useState(false);
  if (!session) return null;
  return (
    <>
      <SectionStack>
        <SplitSection
          id="account-devices"
          title={copy.account.devicesTitle}
          description={copy.account.devicesHint}
        >
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <NavigationLink
                beforeNavigate={confirmNavigation}
                href="/settings/devices"
              >
                {copy.account.devicesAction}
              </NavigationLink>
            </Button>
            <Button asChild variant="ghost">
              <NavigationLink beforeNavigate={confirmNavigation} href="/help">
                {copy.account.helpAction}
              </NavigationLink>
            </Button>
          </div>
        </SplitSection>
        {canManagePlatform(session.user.role) && (
          <SplitSection
            id="account-operations"
            title={copy.account.operationsTitle}
            description={copy.account.operationsHint}
          >
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <NavigationLink
                  beforeNavigate={confirmNavigation}
                  href="/settings/delivery-history"
                >
                  {copy.deliveries.title}
                </NavigationLink>
              </Button>
            </div>
          </SplitSection>
        )}
        <SplitSection
          className="gp-account-deletion"
          id="account-deletion"
          title={copy.account.deleteTitle}
          description={copy.account.deleteHint}
        >
          <div className="gp-account-deletion__heading">
            <span className="gp-account-deletion__icon" aria-hidden="true">
              <UiIcon name="warning" className="size-6" />
            </span>
            <div className="grid gap-2">
              <h3 className="m-0 text-base font-semibold text-primary">
                {copy.account.deleteCardTitle}
              </h3>
              <p className="m-0 text-sm text-secondary">
                {runtime.demoMode
                  ? copy.account.demoHint
                  : copy.account.deleteCardHint}
              </p>
            </div>
          </div>
          <div className="gp-account-deletion__actions">
            <Button variant="destructive" onClick={() => setDeleting(true)}>
              <UiIcon name="trash" />
              {copy.account.deleteAction}
            </Button>
          </div>
        </SplitSection>
      </SectionStack>
      {deleting && (
        <AccountDeletionDialog
          email={session.user.email}
          onClose={() => setDeleting(false)}
        />
      )}
    </>
  );
}
