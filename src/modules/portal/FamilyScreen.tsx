'use client';

import { useState } from 'react';
const numericYear = 'numeric';
import Link from 'next/link';
import Image from 'next/image';
import {
  Button,
  Card,
  EmptyState,
  InitialsAvatar,
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
                <Card key={child.id} className="gp-family-card">
                  <div className="gp-family-card__header">
                    <Image
                      src="/gentlepath/brand-mark.svg"
                      alt={copy.common.decorativeAlt}
                      width={100}
                      height={130}
                      className="gp-family-card__leaf"
                    />
                    <InitialsAvatar name={child.name} />
                    <div>
                      <h2>{child.name}</h2>
                      <p className="mt-1 text-xs text-tertiary">
                        {copy.family.birthDate(
                          new Date(
                            `${child.dateOfBirth}T00:00:00`,
                          ).toLocaleDateString('en-US', {
                            year: numericYear,
                            month: 'long',
                            day: 'numeric',
                          }),
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="gp-family-card__notes">{child.supportNotes}</p>
                  <Button asChild variant="secondary">
                    <Link href={`/milestones?child=${child.id}`}>
                      {copy.navigation.milestones}
                      <UiIcon name="arrowRight" className="size-4" />
                    </Link>
                  </Button>
                  <div className="flex justify-between border-t border-secondary pt-3">
                    <Button variant="ghost" onClick={() => setEditor(child)}>
                      {copy.common.edit}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={remove.isPending}
                      aria-label={copy.family.deleteAction}
                      onClick={() => {
                        void deleteChild(child);
                      }}
                    >
                      <UiIcon name="trash" className="size-4" />
                    </Button>
                  </div>
                </Card>
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
