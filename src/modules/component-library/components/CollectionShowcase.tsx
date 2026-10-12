'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  DataPanel,
  DataTable,
  DirectoryFilters,
  EmptyState,
  Field,
  ListRow,
  MobileRecordRow,
  Modal,
  MultiSelect,
  ReorderableList,
  Select,
  UiIcon,
} from '@/components/ui';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';
const copy = strings.designSystem;
const statuses = { active: 'active', inactive: 'inactive' };
const options = copy.itemNames.map((name, index) => ({
  id: String(index),
  name,
  value: String(index),
  label: name,
}));

export function CollectionShowcase() {
  const [items, setItems] = useState(options);
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState<{ query: string; status?: string }>({
    query: '',
  });
  const [dialog, setDialog] = useState(false);
  const [choice, setChoice] = useState('0');
  const changeFilters = useCallback(
    (value: { query: string; status?: string }) => setFilters(value),
    [],
  );
  const rows = useMemo(
    () =>
      options.filter(
        (item) =>
          item.name.toLowerCase().includes(filters.query.toLowerCase()) &&
          (!filters.status ||
            (filters.status === 'active' ? item.id !== '2' : item.id === '2')),
      ),
    [filters],
  );
  return (
    <ShowcaseSection
      id="collections"
      title={copy.reorder}
      description={copy.advancedHint}
      icon="layers"
    >
      <ReorderableList
        items={items}
        disabled={false}
        label={copy.reorder}
        handleLabel={(item) => strings.designSystem.reorderHandle(item.name)}
        upLabel={(item) => copy.reorderUp(item.name)}
        downLabel={(item) => copy.reorderDown(item.name)}
        onMove={(id, targetId) =>
          setItems((current) => {
            const next = [...current];
            const from = next.findIndex((item) => item.id === id);
            const to = next.findIndex((item) => item.id === targetId);
            next.splice(to, 0, ...next.splice(from, 1));
            return next;
          })
        }
        renderItem={(item, _index, controls, handle) => (
          <ListRow title={item.name} leading={handle} trailing={controls} />
        )}
      />
      <Field labelText={copy.multiSelect}>
        <MultiSelect
          label={copy.multiSelect}
          value={selected}
          options={options}
          placeholder={copy.selectProjects}
          selectionLabel={strings.designSystem.selectedCount}
          clearLabel={copy.clearFilters}
          onValueChange={setSelected}
        />
      </Field>
      <DataPanel
        toolbar={
          <DirectoryFilters
            id="library-directory"
            value={filters}
            onChange={changeFilters}
            statuses={[
              {
                value: statuses.active,
                label: strings.componentLibrary.active,
              },
              {
                value: statuses.inactive,
                label: strings.componentLibrary.inactive,
              },
            ]}
            copy={{
              search: strings.componentLibrary.search,
              placeholder: strings.componentLibrary.searchPlaceholder,
              clear: copy.clearFilters,
              status: strings.directory.status,
              allStatuses: strings.componentLibrary.all,
            }}
          />
        }
      >
        {rows.length ? (
          <DataTable
            embedded
            caption={copy.tableRows}
            rows={rows}
            getRowKey={(item) => item.id}
            columns={[
              {
                key: 'name',
                header: strings.componentLibrary.productName,
                render: (row) => row.name,
              },
              {
                key: 'status',
                header: strings.directory.status,
                render: (row) => (
                  <Badge intent={row.id === '2' ? 'neutral' : 'success'}>
                    {row.id === '2'
                      ? strings.componentLibrary.inactive
                      : strings.componentLibrary.active}
                  </Badge>
                ),
              },
            ]}
            renderMobileRow={(row) => (
              <MobileRecordRow
                title={row.name}
                footer={
                  <Badge intent={row.id === '2' ? 'neutral' : 'success'}>
                    {row.id === '2'
                      ? strings.componentLibrary.inactive
                      : strings.componentLibrary.active}
                  </Badge>
                }
              />
            )}
          />
        ) : (
          <EmptyState
            variant="plain"
            title={copy.noResults}
            description={strings.ui.usersScreen.tryADifferentSearch}
            action={
              <Button
                variant="secondary"
                onClick={() => setFilters({ query: '' })}
              >
                {copy.clearFilters}
              </Button>
            }
          />
        )}
      </DataPanel>
      <Button
        className="w-fit"
        variant="secondary"
        onClick={() => setDialog(true)}
      >
        <UiIcon name="layers" />
        {copy.openDialog}
      </Button>
      <Modal
        open={dialog}
        title={copy.dialog}
        description={copy.dialogHint}
        onDismiss={() => setDialog(false)}
      >
        <div className="grid gap-4">
          <Field labelText={strings.componentLibrary.select}>
            <Select value={choice} onValueChange={setChoice}>
              {options.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Field>
          <Button onClick={() => setDialog(false)}>{copy.close}</Button>
        </div>
      </Modal>
    </ShowcaseSection>
  );
}
