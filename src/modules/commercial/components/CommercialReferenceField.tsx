'use client';
import { useState } from 'react';
import {
  Button,
  DirectoryFilters,
  DirectoryPagination,
  EmptyState,
  Modal,
  QueryBoundary,
} from '@/components/ui';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { useCommercialDetail, useCommercialList } from '../hooks';
import type { CommercialEntity } from '../models/commercialEntity';
import { commercialName } from './commercialFormFields';
interface CommercialReferenceFieldProps {
  id?: string;
  entity: CommercialEntity;
  label: string;
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  optional?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}
export function CommercialReferenceField({
  id,
  entity,
  label,
  value,
  onChange,
  disabled,
  optional,
  ...a11y
}: CommercialReferenceFieldProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const list = useCommercialList(entity, { query, offset, limit: 25 });
  const selected = useCommercialDetail(entity, value);
  return (
    <>
      <div className="flex min-w-0 gap-2">
        <Button
          id={id}
          type="button"
          variant="secondary"
          className="min-w-0 flex-1 justify-start wrap-anywhere"
          disabled={disabled}
          onClick={() => setOpen(true)}
          {...a11y}
        >
          {selected.data ? commercialName(selected.data) : value || copy.none}
        </Button>
        {optional && value && (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            onClick={() => onChange('')}
          >
            {copy.clear}
          </Button>
        )}
      </div>
      <Modal
        open={open}
        title={label}
        onDismiss={() => setOpen(false)}
        footer={
          list.data && (
            <DirectoryPagination
              page={list.data.page}
              count={list.data.data.length}
              busy={list.isFetching}
              label={copy.pagination}
              range={copy.range}
              onNavigate={setOffset}
            />
          )
        }
      >
        <div className="grid gap-4">
          <DirectoryFilters
            id={`${id}-search`}
            value={{ query }}
            showStatus={false}
            statuses={[]}
            onChange={(next) => {
              setQuery(next.query);
              setOffset(0);
            }}
            copy={{
              search: copy.search,
              placeholder: copy.searchPlaceholder,
              clear: copy.clear,
              status: copy.status,
              allStatuses: copy.allStatuses,
            }}
          />
          <QueryBoundary query={list}>
            {(page) => (
              <>
                {page.data.length ? (
                  <ul className="m-0 grid list-none gap-2 p-0">
                    {page.data.map((record) => (
                      <li key={record.id}>
                        <Button
                          type="button"
                          variant={
                            value === record.id ? 'primary' : 'secondary'
                          }
                          className="w-full justify-start wrap-anywhere"
                          onClick={() => {
                            onChange(record.id);
                            setOpen(false);
                          }}
                        >
                          {commercialName(record)}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState
                    title={copy.emptyTitle}
                    description={copy.emptyHint}
                  />
                )}
              </>
            )}
          </QueryBoundary>
        </div>
      </Modal>
    </>
  );
}
