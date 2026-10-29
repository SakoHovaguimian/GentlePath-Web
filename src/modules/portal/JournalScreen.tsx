'use client';

import Image from 'next/image';
import { useState } from 'react';
const numericYear = 'numeric';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  QueryBoundary,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useChildren, useDeleteJournal, useJournals } from './hooks';
import type { JournalEntry } from './models/journalEntry';
import { JournalEditor } from './components/JournalEditor';
import { MutationError } from './components/MutationError';
import {
  CollectionPagination,
  collectionOffset,
} from './components/CollectionPagination';

export function JournalScreen() {
  const query = useJournals();
  const children = useChildren();
  const remove = useDeleteJournal();
  const params = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [editor, setEditor] = useState<JournalEntry | 'new' | null>(() =>
    params.get('new') === 'true' ? 'new' : null,
  );
  const linkedEntry = params.get('entry');
  const selected =
    editor ?? query.data?.find((entry) => entry.id === linkedEntry) ?? null;
  const { showAlert, showToast } = usePresentationService();
  function close() {
    setEditor(null);
    if (params.has('entry') || params.has('new'))
      router.replace('/journal', { scroll: false });
  }
  async function deleteEntry(entry: JournalEntry) {
    if (
      !(await showAlert({
        title: copy.journal.deleteTitle,
        description: copy.journal.deleteDescription,
        tone: 'danger',
        confirmLabel: copy.journal.deleteAction,
        cancelLabel: copy.common.cancel,
      }))
    )
      return;
    try {
      await remove.mutateAsync(entry.id);
      void showToast({ title: copy.journal.deleted, intent: 'success' });
    } catch {
      /* Inline recovery. */
    }
  }
  return (
    <div className="grid gap-7">
      <PageHeader
        title={copy.journal.title}
        description={copy.journal.description}
        eyebrow={copy.common.private}
        action={
          <Button onClick={() => setEditor('new')}>
            <UiIcon name="plus" />
            {copy.journal.create}
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 md:max-w-lg">
          <Input
            type="search"
            aria-label={copy.common.search}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setOffset(0);
            }}
            placeholder={copy.journal.searchPlaceholder}
            leadingIcon={<UiIcon name="search" />}
          />
        </div>
        <Badge>
          <UiIcon name="lock" className="size-3.5" />
          {copy.common.private}
        </Badge>
      </div>
      <MutationError error={remove.error} />
      <QueryBoundary query={query}>
        {(entries) => {
          const filtered = entries.filter((entry) =>
            `${entry.title} ${entry.body}`
              .toLocaleLowerCase()
              .includes(search.toLocaleLowerCase()),
          );
          const start = collectionOffset(offset, filtered.length);
          return filtered.length ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filtered.slice(start, start + 9).map((entry) => (
                  <Card key={entry.id} className="flex flex-col gap-4 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-tertiary">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: numericYear,
                        })}
                      </span>
                      <Badge>{copy.journal.emotions[entry.emotion]}</Badge>
                    </div>
                    <h2 className="m-0 font-display text-xl">{entry.title}</h2>
                    <p className="m-0 line-clamp-4 flex-1 text-sm leading-7 whitespace-pre-line text-secondary">
                      {entry.body}
                    </p>
                    {entry.childId && (
                      <span className="text-xs text-tertiary">
                        {
                          children.data?.find(
                            (child) => child.id === entry.childId,
                          )?.name
                        }
                      </span>
                    )}
                    <div className="mt-2 flex justify-between gap-2 border-t border-secondary pt-3">
                      <Button variant="ghost" onClick={() => setEditor(entry)}>
                        {copy.common.edit}
                        <UiIcon name="arrowRight" className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={remove.isPending}
                        onClick={() => {
                          void deleteEntry(entry);
                        }}
                        aria-label={copy.journal.deleteAction}
                      >
                        <UiIcon name="trash" className="size-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <CollectionPagination
                total={filtered.length}
                offset={start}
                onNavigate={setOffset}
              />
            </>
          ) : (
            <div className="grid gap-4">
              <Image
                src="/gentlepath/care-notes.png"
                alt={copy.common.decorativeAlt}
                width={160}
                height={160}
                className="mx-auto"
              />
              <EmptyState
                title={
                  search ? copy.common.noResultsTitle : copy.journal.emptyTitle
                }
                description={
                  search ? copy.common.noResultsHint : copy.journal.emptyHint
                }
                action={
                  <Button
                    onClick={() => (search ? setSearch('') : setEditor('new'))}
                  >
                    {search ? copy.common.clear : copy.journal.create}
                  </Button>
                }
              />
            </div>
          );
        }}
      </QueryBoundary>
      {selected && (
        <JournalEditor
          key={selected === 'new' ? 'new' : selected.id}
          entry={selected === 'new' ? undefined : selected}
          childrenProfiles={children.data ?? []}
          onClose={close}
        />
      )}
    </div>
  );
}
