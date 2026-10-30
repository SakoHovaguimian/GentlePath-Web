'use client';

import { useState } from 'react';
import {
  Button,
  EmptyState,
  Page,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useChildren, useDeleteChild } from './hooks';
import type { ChildProfile } from './models/childProfile';
import { ChildProfileEditor } from './components/ChildProfileEditor';
import { MutationError } from './components/MutationError';
import { PortalBanner } from './components/PortalBanner';
import { FamilyProfileCard } from './components/FamilyProfileCard';
import './styles/portal.css';

export function FamilyScreen() {
  const query = useChildren();
  const remove = useDeleteChild();
  const [editor, setEditor] = useState<ChildProfile | 'new' | null>(null);
  const { showAlert, showToast } = usePresentationService();
  async function deleteChild(child: ChildProfile) {
    if (
      !(await showAlert({
        title: copy.family.deleteTitle,
        description: copy.family.deleteDescription,
        tone: 'danger',
        confirmLabel: copy.family.deleteAction,
        cancelLabel: copy.common.cancel,
      }))
    )
      return;
    try {
      await remove.mutateAsync(child.id);
      void showToast({ title: copy.family.deleted, intent: 'success' });
    } catch {
      /* Inline error. */
    }
  }
  return (
    <Page className="gp-portal-page gp-family">
      <PageHeader
        title={copy.family.title}
        description={copy.family.description}
        eyebrow={copy.common.private}
        action={
          <Button onClick={() => setEditor('new')}>
            <UiIcon name="plus" />
            {copy.family.create}
          </Button>
        }
      />
      <PortalBanner
        title={copy.family.bannerTitle}
        description={copy.family.bannerDescription}
        image="/gentlepath/community-garden-v2.png"
        tone="lilac"
        landscape
      />
      <MutationError error={remove.error} />
      <QueryBoundary query={query}>
        {(children) =>
          children.length ? (
            <div className="gp-family-grid">
              {children.map((child) => (
                <FamilyProfileCard
                  key={child.id}
                  child={child}
                  removing={remove.isPending}
                  onOpen={() => setEditor(child)}
                  onRemove={() => void deleteChild(child)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="user"
              title={copy.family.emptyTitle}
              description={copy.family.emptyHint}
              action={
                <Button onClick={() => setEditor('new')}>
                  {copy.family.create}
                </Button>
              }
            />
          )
        }
      </QueryBoundary>
      {editor && (
        <ChildProfileEditor
          key={editor === 'new' ? 'new' : editor.id}
          child={editor === 'new' ? undefined : editor}
          onClose={() => setEditor(null)}
        />
      )}
    </Page>
  );
}
