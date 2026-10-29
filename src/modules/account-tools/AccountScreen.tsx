'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Button,
  DescriptionList,
  Page,
  PageHeader,
  SectionStack,
  SplitSection,
} from '@/components/ui';
import { useSessionState } from '@/providers/AppProviders';
import { useRuntimeConfig } from '@/providers/RuntimeProvider';
import { canManagePlatform } from '@/services/auth/permissions';
import { gentlePathAccountToolsStrings as copy } from '@/strings';
import { AccountDeletionDialog } from './components/AccountDeletionDialog';

export function AccountScreen() {
  const { session } = useSessionState();
  const runtime = useRuntimeConfig();
  const [deleting, setDeleting] = useState(false);
  if (!session) return null;
  return (
    <Page>
      <PageHeader
        title={copy.account.title}
        description={copy.account.description}
        eyebrow={copy.common.accountEyebrow}
      />
      <SectionStack>
        <SplitSection
          id="account-identity"
          title={copy.account.identityTitle}
          description={copy.account.identityHint}
        >
          <DescriptionList
            items={[
              { label: copy.account.emailLabel, value: session.user.email },
              {
                label: copy.account.nameLabel,
                value: copy.account.formatName(
                  session.user.firstName,
                  session.user.lastName,
                ),
              },
            ]}
          />
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/profile">{copy.account.profileAction}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/settings/devices">{copy.account.devicesAction}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/help">{copy.account.helpAction}</Link>
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
                <Link href="/settings/delivery-history">
                  {copy.deliveries.title}
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/admin/ai-usage">{copy.aiUsage.title}</Link>
              </Button>
            </div>
          </SplitSection>
        )}
        <SplitSection
          id="account-deletion"
          title={copy.account.deleteTitle}
          description={copy.account.deleteHint}
        >
          {runtime.demoMode && (
            <p className="m-0 text-sm text-secondary">
              {copy.account.demoHint}
            </p>
          )}
          <div>
            <Button variant="destructive" onClick={() => setDeleting(true)}>
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
    </Page>
  );
}
