import type { ReactNode } from 'react';
export type Column<T> = {
  key: string;
  header: string;
  sort?: { direction?: 'asc' | 'desc'; label: string; onSort: () => void };
  cellClassName?: string;
  headerClassName?: string;
  render: (row: T) => ReactNode;
};
