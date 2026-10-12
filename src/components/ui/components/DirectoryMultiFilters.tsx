'use client';

import { useCallback, useRef } from 'react';
import {
  useDirectoryFilters,
  type DirectoryFiltersValue,
} from '../lib/useDirectoryFilters';
import { Field, Input } from './Input';
import { IconButton } from './IconButton';
import { MultiSelect } from './MultiSelect';
import { UiIcon } from './UiIcon';

interface DirectoryMultiFiltersProps<Status extends string> {
  id: string;
  value: DirectoryFiltersValue<Status[]>;
  onChange: (value: { query: string; status: Status[] }) => void;
  statuses: readonly { value: Status; label: string }[];
  copy: {
    search: string;
    placeholder: string;
    clear: string;
    status: string;
    allStatuses: string;
    selected: (count: number) => string;
    clearStatuses: string;
  };
}

export function DirectoryMultiFilters<Status extends string>({
  id,
  value,
  onChange,
  statuses,
  copy,
}: DirectoryMultiFiltersProps<Status>) {
  const apply = useCallback(
    (next: DirectoryFiltersValue<Status[]>) =>
      onChange({ ...next, status: next.status ?? [] }),
    [onChange],
  );
  const filters = useDirectoryFilters(value, apply);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <form
      noValidate
      role="search"
      onSubmit={filters.submit}
      className="@container flex min-w-0 flex-wrap items-end gap-3"
    >
      <div className="flex min-w-0 flex-1 basis-72 items-center gap-2 lg:max-w-xl">
        <label htmlFor={id} className="sr-only">
          {copy.search}
        </label>
        <div className="min-w-0 flex-1">
          <Input
            ref={inputRef}
            id={id}
            type="search"
            value={filters.draft.query}
            maxLength={200}
            placeholder={copy.placeholder}
            leadingIcon={<UiIcon name="search" />}
            onChange={(event) => filters.changeQuery(event.target.value)}
            onCompositionStart={filters.startComposition}
            onCompositionEnd={filters.endComposition}
          />
        </div>
        {filters.draft.query && (
          <IconButton
            type="button"
            variant="ghost"
            label={copy.clear}
            onClick={() => {
              filters.clear();
              inputRef.current?.focus();
            }}
          >
            <UiIcon name="close" className="size-4" />
          </IconButton>
        )}
      </div>
      <div className="w-full @2xl:ms-auto @2xl:w-auto">
        <Field labelText={copy.status} orientation="inline">
          <MultiSelect
            className="w-full @2xl:w-64"
            value={filters.draft.status ?? []}
            options={statuses}
            onValueChange={filters.changeStatus}
            label={copy.status}
            placeholder={copy.allStatuses}
            selectionLabel={copy.selected}
            clearLabel={copy.clearStatuses}
          />
        </Field>
      </div>
    </form>
  );
}
