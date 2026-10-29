'use client';
import { useState } from 'react';
import { Button, Message, Modal, NavigationLink } from '@/components/ui';
import { useNavigationGuard } from '@/providers/NavigationGuardProvider';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathCommercialStrings as copy } from '@/strings';
import type { AdCreativePublic } from '../models/adCreative';
import { useCommercialDestination } from '../hooks';
export function CreativeAction({ creative }: { creative: AdCreativePublic }) {
  const destination = useCommercialDestination(
    creative.action_type === 'OPEN_APP_ROUTE'
      ? (creative.action_value ?? '')
      : '',
  );
  const { confirmNavigation } = useNavigationGuard();
  const { showToast } = usePresentationService();
  const [copyError, setCopyError] = useState(false);
  const [copying, setCopying] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  if (creative.action_type === 'COPY_DISCOUNT_CODE')
    return (
      <div className="grid gap-3">
        <code className="text-sm text-primary">{creative.action_value}</code>
        <Button
          variant="secondary"
          loading={copying}
          onClick={async () => {
            if (copying) return;
            setCopying(true);
            try {
              await navigator.clipboard.writeText(creative.action_value!);
              setCopyError(false);
              void showToast({ title: copy.copiedTitle, intent: 'success' });
            } catch {
              setCopyError(true);
            } finally {
              setCopying(false);
            }
          }}
        >
          {creative.action_title}
        </Button>
        {copyError && (
          <Message
            title={copy.errorTitle}
            description={copy.copyErrorHint}
            intent="danger"
          />
        )}
      </div>
    );
  if (creative.action_type === 'OPEN_APP_ROUTE')
    return destination.data ? (
      <Button asChild variant="secondary">
        <NavigationLink
          href={destination.data.href}
          beforeNavigate={() => confirmNavigation()}
        >
          {creative.action_title}
        </NavigationLink>
      </Button>
    ) : (
      <div className="grid gap-3">
        <Button variant="secondary" disabled loading={destination.isFetching}>
          {creative.action_title}
        </Button>
        {destination.isError && (
          <Message
            title={copy.errorTitle}
            description={copy.validation.notFound}
            intent="danger"
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  void destination.refetch();
                }}
              >
                {copy.retry}
              </Button>
            }
          />
        )}
      </div>
    );
  if (creative.action_type === 'OPEN_IN_APP_BROWSER')
    return (
      <>
        <Button variant="secondary" onClick={() => setBrowserOpen(true)}>
          {creative.action_title}
        </Button>
        <Modal
          open={browserOpen}
          title={creative.title}
          onDismiss={() => setBrowserOpen(false)}
        >
          <div className="grid gap-4">
            <iframe
              src={creative.action_value ?? undefined}
              title={creative.title}
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
              className="h-[60dvh] w-full rounded-xl border border-secondary"
            />
            <Button asChild variant="secondary">
              <a
                href={creative.action_value ?? ''}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.visit}
              </a>
            </Button>
          </div>
        </Modal>
      </>
    );
  return (
    <Button asChild variant="secondary">
      <a
        href={creative.action_value ?? ''}
        target="_blank"
        rel="noopener noreferrer"
      >
        {creative.action_title}
      </a>
    </Button>
  );
}
