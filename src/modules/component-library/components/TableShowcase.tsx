'use client';

import { useState } from 'react';
import {
  Badge,
  Checkbox,
  Chip,
  DataTable,
  IconButton,
  UiIcon,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { strings } from '@/strings';
import { ShowcaseSection } from './ShowcaseSection';
const copy = strings.componentLibrary;

export function TableShowcase() {
  const [selected, setSelected] = useState(false);
  const presentation = usePresentationService();
  return (
    <ShowcaseSection
      id="table"
      title={copy.table}
      description={copy.tableHint}
      icon="grid"
    >
      <DataTable
        caption={copy.productTableCaption}
        getRowKey={(row) => row.id}
        rows={[{ id: 'example-product', name: copy.sampleProduct }]}
        columns={[
          {
            key: 'selection',
            header: copy.selected,
            render: (row) => (
              <Checkbox
                label={
                  <span className="sr-only">
                    {copy.selectProduct(row.name)}
                  </span>
                }
                checked={selected}
                onChange={(event) => setSelected(event.target.checked)}
              />
            ),
          },
          {
            key: 'product',
            header: copy.productColumn,
            render: (row) => (
              <span className="flex min-w-64 items-center gap-3">
                <UiIcon name="leaf" className="text-brand-secondary" />
                {row.name}
              </span>
            ),
          },
          {
            key: 'sku',
            header: copy.skuColumn,
            render: () => (
              <span className="whitespace-nowrap font-mono text-xs">
                {copy.sampleSku}
              </span>
            ),
          },
          {
            key: 'category',
            header: copy.category,
            render: () => (
              <Chip icon={<UiIcon name="leaf" className="size-4" />}>
                {copy.categoryLabels.flower}
              </Chip>
            ),
          },
          { key: 'brand', header: copy.brand, render: () => copy.sampleBrand },
          {
            key: 'status',
            header: copy.statusCard,
            render: () => (
              <Badge intent="success" dot>
                {copy.active}
              </Badge>
            ),
          },
          { key: 'price', header: copy.price, render: () => copy.samplePrice },
          { key: 'stock', header: copy.stock, render: () => copy.sampleStock },
          {
            key: 'updated',
            header: copy.updated,
            render: () => (
              <span className="whitespace-nowrap">{copy.sampleDate}</span>
            ),
          },
          {
            key: 'actions',
            header: copy.actions,
            render: () => (
              <IconButton
                label={copy.productActions}
                onClick={() => {
                  void presentation.showSheet({
                    title: copy.sheetTitle,
                    description: copy.actionPreviewHint,
                    confirmLabel: copy.close,
                    cancelLabel: copy.cancel,
                  });
                }}
              >
                <UiIcon name="settings" />
              </IconButton>
            ),
          },
        ]}
      />
      <p role="status" className="m-0 text-xs text-tertiary">
        {copy.selectedCount(selected ? 1 : 0)}
      </p>
    </ShowcaseSection>
  );
}
