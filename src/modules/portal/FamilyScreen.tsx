'use client';

import { useState } from 'react';
const numericYear = 'numeric';
import Link from 'next/link';
import {
  Button,
  Card,
  EmptyState,
  InitialsAvatar,
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
    <div className="grid gap-7">
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
      <MutationError error={remove.error} />
      <QueryBoundary query={query}>
        {(children) =>
          children.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {children.map((child) => (
                <Card key={child.id} className="flex flex-col gap-5 p-6">
                  <div className="flex items-center gap-4">
                    <InitialsAvatar name={child.name} />
                    <div>
                      <h2 className="m-0 font-display text-xl">{child.name}</h2>
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
                  <p className="m-0 flex-1 text-sm leading-7 whitespace-pre-line text-secondary">
                    {child.supportNotes}
                  </p>
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
                      variant="ghost"
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
    </div>
  );
}
