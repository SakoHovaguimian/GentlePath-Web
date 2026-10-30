'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Field, Input } from './Input';
import { Select } from './Select';
import { UiIcon } from './UiIcon';
import { IconButton } from './IconButton';
import {
  useDirectoryFilters,
  type DirectoryFiltersValue,
} from '../lib/useDirectoryFilters';

const anyStatus = '';

interface DirectoryFiltersProps<Status extends string> {
  id: string;
  value: DirectoryFiltersValue<Status>;
  onChange: (value: DirectoryFiltersValue<Status>) => void;
  statuses: readonly { value: Status; label: string }[];
  additionalFilters?: ReactNode;
  showStatus?: boolean;
  layout?: 'inline' | 'stackedSearch';
  copy: {
    search: string;
    placeholder: string;
    clear: string;
    status: string;
    allStatuses: string;
  };
}

// Search grows alongside filters, with every label above its control.
export function DirectoryFilters<Status extends string>({
  id,
  value,
  onChange,
  statuses,
  copy,
  additionalFilters,
  showStatus = true,
  layout = 'inline',
}: DirectoryFiltersProps<Status>) {
  const filters = useDirectoryFilters(value, onChange);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <form
      noValidate
      role="search"
      onSubmit={filters.submit}
      className={cn(
        layout === 'stackedSearch'
          ? '@container grid min-w-0 gap-3'
          : '@container flex min-w-0 flex-wrap items-end gap-3',
      )}
    >
      <div
        className={cn(
          'flex min-w-0 items-end gap-2',
          layout === 'stackedSearch'
            ? 'w-full'
            : cn(
                'flex-1 lg:max-w-xl',
                additionalFilters ? 'basis-64' : 'basis-72',
              ),
        )}
      >
        <div className="grid min-w-0 flex-1 gap-1.5">
          <label htmlFor={id} className="text-sm font-medium text-secondary">
            {copy.search}
          </label>
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
      {(showStatus || additionalFilters) && (
        <div
          className={cn(
            layout === 'stackedSearch'
              ? cn(
                  'grid w-full min-w-0 gap-3',
                  showStatus && additionalFilters
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1',
                  'items-start',
                )
              : additionalFilters
                ? 'grid w-full min-w-0 grid-cols-2 gap-3 @4xl:ms-auto @4xl:flex @4xl:w-auto @4xl:items-end'
                : 'w-full @2xl:ms-auto @2xl:w-auto',
          )}
        >
          {showStatus && (
            <Field labelText={copy.status}>
              <Select
                className={
                  additionalFilters && layout === 'inline'
                    ? '@4xl:w-40'
                    : layout === 'stackedSearch'
                      ? 'min-w-0'
                      : 'w-full @2xl:w-56'
                }
                value={filters.draft.status ?? ''}
                onValueChange={(nextValue) =>
                  filters.changeStatus(
                    statuses.find((item) => item.value === nextValue)?.value,
                  )
                }
              >
                <option value={anyStatus}>{copy.allStatuses}</option>
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          {additionalFilters}
        </div>
      )}
    </form>
  );
}
