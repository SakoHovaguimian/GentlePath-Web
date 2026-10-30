'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
const numericYear = 'numeric';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  Field,
  Page,
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
import { PortalBanner } from './components/PortalBanner';
import {
  CollectionPagination,
  collectionOffset,
} from './components/CollectionPagination';
import './styles/portal.css';

export function JournalScreen() {
  const query = useJournals();
  const children = useChildren();
  const remove = useDeleteJournal();
  const params = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
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
    <Page className="gp-portal-page gp-journal">
      <PageHeader
        title={copy.journal.title}
        description={copy.journal.description}
        action={
          <Button onClick={() => setEditor('new')}>
            <UiIcon name="plus" />
            {copy.journal.create}
          </Button>
        }
      />
      <PortalBanner
        title={copy.journal.bannerTitle}
        description={copy.journal.bannerDescription}
        image="/gentlepath/reading-garden-v2.png"
        tone="lilac"
        landscape
      />
      <div className="gp-journal-toolbar">
        <div className="gp-journal-search">
          <Field labelText={copy.common.search}>
            <Input
              ref={searchRef}
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
          </Field>
          {search && (
            <IconButton
              className="gp-journal-search__clear"
              variant="ghost"
              label={copy.common.clear}
              onClick={() => {
                setSearch('');
                setOffset(0);
                searchRef.current?.focus();
              }}
            >
              <UiIcon name="close" className="size-4" />
            </IconButton>
          )}
        </div>
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
              <div className="gp-journal-grid">
                {filtered.slice(start, start + 9).map((entry) => (
                  <Card
                    key={entry.id}
                    className="gp-journal-card"
                    data-emotion={entry.emotion}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs text-tertiary">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: numericYear,
                        })}
                      </span>
                    </div>
                    <div className="gp-journal-card__tags">
                      {entry.childId && (
                        <span className="gp-child-tag">
                          <UiIcon name="user" className="size-3.5" />
                          {
                            children.data?.find(
                              (child) => child.id === entry.childId,
                            )?.name
                          }
                        </span>
                      )}
                      <span className="gp-emotion" data-emotion={entry.emotion}>
                        {copy.journal.emotions[entry.emotion]}
                      </span>
                    </div>
                    <h2>{entry.title}</h2>
                    <p className="m-0 line-clamp-4 flex-1 text-sm leading-7 whitespace-pre-line text-secondary">
                      {entry.body}
                    </p>
                    <div className="mt-2 flex justify-between gap-2 border-t border-secondary pt-3">
                      <Button variant="ghost" onClick={() => setEditor(entry)}>
                        {copy.common.edit}
                        <UiIcon name="arrowRight" className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
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
      <p className="gp-portal-footnote">
        <UiIcon name="leaf" className="size-5" />
        {copy.journal.quoteDescription}
      </p>
      {selected && (
        <JournalEditor
          key={selected === 'new' ? 'new' : selected.id}
          entry={selected === 'new' ? undefined : selected}
          childrenProfiles={children.data ?? []}
          onClose={close}
        />
      )}
    </Page>
  );
}
