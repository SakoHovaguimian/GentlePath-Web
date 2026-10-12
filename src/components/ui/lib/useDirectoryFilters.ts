'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
type DirectoryStatus = string | readonly string[];

export type DirectoryFiltersValue<Status extends DirectoryStatus> = {
  query: string;
  status?: Status;
};

const searchDelay = 300;
const statusKey = (status: DirectoryStatus | undefined) =>
  Array.isArray(status) ? status.join(',') : status;

const sameFilters = <Status extends DirectoryStatus>(
  a: DirectoryFiltersValue<Status>,
  b: DirectoryFiltersValue<Status>,
) => a.query === b.query && statusKey(a.status) === statusKey(b.status);

export function useDirectoryFilters<Status extends DirectoryStatus>(
  value: DirectoryFiltersValue<Status>,
  onChange: (value: DirectoryFiltersValue<Status>) => void,
) {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);
  const [applied, setApplied] = useState<DirectoryFiltersValue<Status>>();
  const [composing, setComposing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const valueQuery = value.query;
  const valueStatus = statusKey(value.status);

  // Own URL updates acknowledge the draft without replacing newer typing.
  // Back/Forward or an external URL change restores its filters instead.
  if (!sameFilters(committed, value)) {
    setCommitted(value);
    if (!applied || !sameFilters(applied, value)) setDraft(value);
    setApplied(undefined);
  }

  function cancelSearch() {
    clearTimeout(timer.current);
  }

  function apply(next: DirectoryFiltersValue<Status>) {
    cancelSearch();
    const normalized = { ...next, query: next.query.trim() };
    if (sameFilters(normalized, value)) return;
    setApplied(normalized);
    onChange(normalized);
  }

  useEffect(() => {
    if (
      composing ||
      (draft.query.trim() === valueQuery &&
        statusKey(draft.status) === valueStatus)
    )
      return;
    timer.current = setTimeout(() => {
      const next = { ...draft, query: draft.query.trim() };
      setApplied(next);
      onChange(next);
    }, searchDelay);
    return () => clearTimeout(timer.current);
  }, [draft, composing, valueQuery, valueStatus, onChange]);

  function changeQuery(query: string) {
    cancelSearch();
    setDraft((current) => ({ ...current, query }));
  }

  function changeStatus(status: DirectoryFiltersValue<Status>['status']) {
    const next = { ...draft, status };
    setDraft(next);
    if (!composing) apply(next);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!composing) apply(draft);
  }

  return {
    draft,
    changeQuery,
    changeStatus,
    submit,
    startComposition: () => {
      cancelSearch();
      setComposing(true);
    },
    endComposition: () => setComposing(false),
    clear: () => {
      const next = { ...draft, query: '' };
      setDraft(next);
      apply(next);
    },
  };
}
