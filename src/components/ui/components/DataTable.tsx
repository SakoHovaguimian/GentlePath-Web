import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Button } from './Button';
import { UiIcon } from './UiIcon';
import { strings } from '@/strings';
import { TableRowLink } from './TableRowLink';
import styles from './DataTable.module.css';

import type { Column } from '../models/tableColumn';
export type { Column } from '../models/tableColumn';

function TableSortButton({
  header,
  sort,
}: {
  header: string;
  sort: NonNullable<Column<unknown>['sort']>;
}) {
  return (
    <Button
      variant="ghost"
      className="-mx-2 min-h-11 shrink-0 gap-2 px-2 py-1 text-xs font-medium whitespace-nowrap"
      aria-label={sort.label}
      onClick={sort.onSort}
    >
      {header}
      <UiIcon
        name="arrowUp"
        className={cn(
          'size-4',
          sort.direction === 'desc' && 'rotate-180',
          !sort.direction && 'opacity-40',
        )}
      />
    </Button>
  );
}

export function DataTable<T>({
  columns,
  rows,
  caption = strings.componentLibrary.tableCaption,
  getRowKey,
  getRowHref,
  onRowNavigate,
  renderMobileRow,
  embedded = false,
}: {
  columns: Column<T>[];
  rows: T[];
  caption?: string;
  getRowKey?: (row: T) => string;
  // Include a visible, named record link in the row for keyboard/screen readers.
  // Undefined leaves unavailable rows passive. Other controls keep their actions.
  getRowHref?: (row: T) => string | undefined;
  onRowNavigate?: (href: string) => void;
  renderMobileRow?: (row: T) => ReactNode;
  // Drops the outer frame when a DataPanel already owns the surface.
  embedded?: boolean;
}) {
  return (
    <>
      {renderMobileRow && columns.some((column) => column.sort) && (
        <div
          role="group"
          aria-label={strings.ui.dataTable.sortColumns}
          tabIndex={0}
          className="flex min-w-0 flex-nowrap items-center gap-6 overflow-x-auto overscroll-x-contain border-b border-secondary px-4 py-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand md:hidden"
        >
          {columns.map((column) =>
            column.sort ? (
              <TableSortButton
                key={column.key}
                header={column.header}
                sort={column.sort}
              />
            ) : null,
          )}
        </div>
      )}
      {renderMobileRow && (
        <ul
          aria-label={caption}
          className={cn(
            'm-0 grid list-none p-0 md:hidden',
            embedded
              ? 'divide-y divide-secondary [&_.ui-section-card]:rounded-none [&_.ui-section-card]:border-0 [&_.ui-section-card]:shadow-none'
              : 'gap-3',
          )}
        >
          {rows.map((row, index) => {
            const href = getRowHref?.(row);
            return (
              <li
                key={getRowKey?.(row) ?? index}
                className={cn(
                  href && styles.surface,
                  href &&
                    'cursor-pointer hover:bg-secondary_subtle has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-brand',
                )}
              >
                <div className={href ? styles.content : 'contents'}>
                  {renderMobileRow(row)}
                </div>
                {href && (
                  <TableRowLink href={href} onNavigate={onRowNavigate} />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div
        className={cn(
          !embedded &&
            'overflow-hidden rounded-xl border border-secondary bg-primary',
          renderMobileRow && 'hidden md:block',
        )}
      >
        <div
          className="overflow-x-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
          tabIndex={0}
          role="region"
          aria-label={caption}
        >
          <table className="min-w-full divide-y divide-secondary">
            <caption className="sr-only">{caption}</caption>
            <thead className="bg-secondary_subtle">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      column.sort?.direction === 'asc'
                        ? 'ascending'
                        : column.sort?.direction === 'desc'
                          ? 'descending'
                          : undefined
                    }
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium whitespace-nowrap text-tertiary first:ps-6 last:pe-6',
                      column.headerClassName,
                    )}
                  >
                    {column.sort ? (
                      <TableSortButton
                        header={column.header}
                        sort={column.sort}
                      />
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary bg-primary">
              {rows.map((row, index) => {
                const href = getRowHref?.(row);
                return (
                  <tr
                    key={getRowKey?.(row) ?? index}
                    className={cn(
                      'ui-table-row hover:bg-secondary_subtle',
                      href &&
                        'cursor-pointer has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-brand',
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          'px-4 py-3 align-middle text-sm text-secondary first:ps-6 last:pe-6',
                          column.cellClassName,
                          href && styles.surface,
                        )}
                      >
                        <div className={href ? styles.content : 'contents'}>
                          {column.render(row)}
                        </div>
                        {href && (
                          <TableRowLink
                            href={href}
                            onNavigate={onRowNavigate}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
