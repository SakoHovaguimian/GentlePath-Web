'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  EmptyState,
  IconButton,
  Input,
  Field,
  Message,
  Page,
  PageHeader,
  QueryBoundary,
  Select,
  UiIcon,
} from '@/components/ui';
import { gentlePathPortalStrings as copy } from '@/strings';
import { useChildren, useJournals } from './hooks';
import { useJournalRemoval } from './useJournalRemoval';
import type { JournalEntry } from './models/journalEntry';
import { JournalEditor } from './components/JournalEditor';
import { JournalEntryCard } from './components/JournalEntryCard';
import { MutationError } from './components/MutationError';
import {
  CollectionPagination,
  collectionOffset,
} from './components/CollectionPagination';
import './styles/portal.css';

const allJournalEntries = 'all';
const personalJournalEntries = 'personal';

export function JournalScreen() {
  const focusedEntryId = useSearchParams().get('focus') || null;
  return (
    <JournalContent key={focusedEntryId} focusedEntryId={focusedEntryId} />
  );
}

function JournalContent({ focusedEntryId }: { focusedEntryId: string | null }) {
  const query = useJournals();
  const children = useChildren();
  const { mutation: remove, deleteEntry } = useJournalRemoval();
  const params = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [childFilter, setChildFilter] = useState(allJournalEntries);
  const searchRef = useRef<HTMLInputElement>(null);
  const [offset, setOffset] = useState<number | null>(null);
  const [editor, setEditor] = useState<JournalEntry | 'new' | null>(() =>
    params.get('new') === 'true' ? 'new' : null,
  );
  const linkedEntry = params.get('entry');
  const selected =
    editor ?? query.data?.find((entry) => entry.id === linkedEntry) ?? null;
  function close() {
    setEditor(null);
    if (params.has('entry') || params.has('new'))
      router.replace('/journal', { scroll: false });
  }
  return (
    <Page className="gp-portal-page gp-journal">
      <PageHeader
        title={copy.journal.title}
        description={copy.journal.description}
        action={
          <Button
            onClick={() => setEditor('new')}
            disabled={children.data === undefined}
          >
            <UiIcon name="plus" />
            {copy.journal.create}
          </Button>
        }
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
        <Field
          labelText={copy.journal.filterLabel}
          className="gp-journal-child-filter"
        >
          <Select
            value={childFilter}
            onValueChange={(value) => {
              setChildFilter(value);
              setOffset(0);
            }}
          >
            <option value={allJournalEntries}>{copy.journal.allEntries}</option>
            <option value={personalJournalEntries}>
              {copy.journal.personal}
            </option>
            {(children.data ?? []).map((child) => (
              <option key={child.id} value={child.id}>
                {child.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {children.isError && (
        <Message
          title={copy.journal.profilesUnavailableTitle}
          description={copy.journal.profilesUnavailableHint}
          intent="warning"
          action={
            <Button variant="secondary" onClick={() => void children.refetch()}>
              {copy.journal.reloadProfilesAction}
            </Button>
          }
        />
      )}
      <MutationError error={remove.error} />
      <QueryBoundary query={query}>
        {(entries) => {
          const filtered = entries.filter(
            (entry) =>
              (childFilter === allJournalEntries ||
                (childFilter === personalJournalEntries
                  ? entry.childId === null
                  : entry.childId === childFilter)) &&
              `${entry.title} ${entry.body}`
                .toLocaleLowerCase('en-US')
                .includes(search.toLocaleLowerCase('en-US')),
          );
          const targetIndex = filtered.findIndex(
            (entry) => entry.id === focusedEntryId,
          );
          const initialOffset =
            targetIndex < 0 ? 0 : Math.floor(targetIndex / 9) * 9;
          const start = collectionOffset(
            offset ?? initialOffset,
            filtered.length,
          );
          const unavailable =
            focusedEntryId &&
            !entries.some((entry) => entry.id === focusedEntryId);
          return (
            <>
              {unavailable && (
                <Message
                  title={copy.journal.unavailableTitle}
                  description={copy.journal.unavailableHint}
                  intent="warning"
                />
              )}
              {filtered.length ? (
                <>
                  <div className="gp-journal-grid">
                    {filtered.slice(start, start + 9).map((entry) => (
                      <JournalEntryCard
                        key={entry.id}
                        entry={entry}
                        childrenProfiles={children.data ?? []}
                        focused={offset === null && entry.id === focusedEntryId}
                        removing={remove.isPending}
                        onEdit={() => setEditor(entry)}
                        onDelete={() => void deleteEntry(entry)}
                      />
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
                      search || childFilter !== allJournalEntries
                        ? copy.journal.noResultsTitle
                        : copy.journal.emptyTitle
                    }
                    description={
                      search || childFilter !== allJournalEntries
                        ? copy.journal.noResultsHint
                        : copy.journal.emptyHint
                    }
                    action={
                      <Button
                        disabled={
                          !search &&
                          childFilter === allJournalEntries &&
                          children.data === undefined
                        }
                        onClick={() => {
                          if (search || childFilter !== allJournalEntries) {
                            setSearch('');
                            setChildFilter(allJournalEntries);
                            setOffset(0);
                            searchRef.current?.focus();
                          } else setEditor('new');
                        }}
                      >
                        {search || childFilter !== allJournalEntries
                          ? copy.journal.clearFiltersAction
                          : copy.journal.create}
                      </Button>
                    }
                  />
                </div>
              )}
            </>
          );
        }}
      </QueryBoundary>
      <p className="gp-portal-footnote">
        <UiIcon name="leaf" className="size-5" />
        {copy.journal.quoteDescription}
      </p>
      {selected && children.data !== undefined && (
        <JournalEditor
          key={selected === 'new' ? 'new' : selected.id}
          entry={selected === 'new' ? undefined : selected}
          childrenProfiles={children.data ?? []}
          onClose={close}
          onDelete={
            selected === 'new' ? undefined : () => deleteEntry(selected)
          }
          removing={remove.isPending}
          removalError={remove.error}
        />
      )}
    </Page>
  );
}
