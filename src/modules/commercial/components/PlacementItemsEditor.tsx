'use client';
import { useRef, useState } from 'react';
import {
  Button,
  Card,
  EmptyState,
  Field,
  FormActions,
  FormSection,
  Input,
  Message,
  ReorderableList,
  Switch,
} from '@/components/ui';
import { usePresentationService } from '@/presentation/PresentationProvider';
import { useUnsavedFormGuard } from '@/providers/useUnsavedFormGuard';
import { MutationError } from '@/modules/portal/components/MutationError';
import { gentlePathCommercialStrings as copy } from '@/strings';
import { useCommercialMutation } from '../hooks';
import type { AdPlacement } from '../models/adPlacement';
import { AdPlacementItemsSchema } from '../models/adPlacementItem';
import type { PlacementItemDraft } from '../models/placementItemDraft';
import { CommercialReferenceField } from './CommercialReferenceField';
import { localDateTime, isoDateTime } from './commercialFormFields';
interface PlacementItemsEditorProps {
  placement: AdPlacement;
}
function drafts(placement: AdPlacement): PlacementItemDraft[] {
  return (placement.items ?? []).map((item) => ({
    id: item.id,
    existingId: item.id,
    creative_id: item.creative_id,
    is_enabled: item.is_enabled,
    starts_at: localDateTime(item.starts_at),
    ends_at: localDateTime(item.ends_at),
  }));
}
export function PlacementItemsEditor({ placement }: PlacementItemsEditorProps) {
  const [items, setItems] = useState(() => drafts(placement));
  const [creative, setCreative] = useState('');
  const [invalid, setInvalid] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const dirty = useRef(false);
  const busy = useRef(false);
  useUnsavedFormGuard(dirty, busy);
  const { showAlert, showToast } = usePresentationService();
  const save = useCommercialMutation(
    (service, input: Parameters<typeof service.replaceItems>[1]) =>
      service.replaceItems(placement.id, input),
  );
  const change = (id: string, values: Partial<PlacementItemDraft>) => {
    dirty.current = true;
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...values } : item)),
    );
  };
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const parsed = AdPlacementItemsSchema.safeParse({
      items: items.map((item) => ({
        ...(item.existingId ? { id: item.existingId } : {}),
        creative_id: item.creative_id,
        is_enabled: item.is_enabled,
        starts_at: item.starts_at ? isoDateTime(item.starts_at) : null,
        ends_at: item.ends_at ? isoDateTime(item.ends_at) : null,
      })),
    });
    if (!parsed.success) {
      setInvalid(true);
      requestAnimationFrame(() =>
        form.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setInvalid(false);
    busy.current = true;
    try {
      const saved = await save.mutateAsync(parsed.data.items);
      setItems(drafts(saved));
      dirty.current = false;
      void showToast({ title: copy.itemsSavedTitle, intent: 'success' });
    } catch {
      /* Preserve draft. */
    } finally {
      busy.current = false;
    }
  }
  async function removeItem(item: PlacementItemDraft) {
    if (
      !(await showAlert({
        title: copy.removeItem,
        description: copy.deleteDescription(item.creative_id),
        confirmLabel: copy.removeItem,
        cancelLabel: copy.cancel,
        tone: 'warning',
      }))
    )
      return;
    dirty.current = true;
    setItems((current) => current.filter((row) => row.id !== item.id));
  }
  return (
    <Card>
      <form ref={form} noValidate onSubmit={submit} className="grid gap-5">
        <FormSection
          id="commercial-placement-items"
          title={copy.itemsTitle}
          description={copy.itemsHint}
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field labelText={copy.creativeLabel}>
              <CommercialReferenceField
                id="placement-add-creative"
                entity="creatives"
                label={copy.creativeLabel}
                value={creative}
                onChange={setCreative}
                disabled={save.isPending}
              />
            </Field>
            <Button
              type="button"
              variant="secondary"
              disabled={
                save.isPending ||
                !creative ||
                items.length >= 50 ||
                items.some((item) => item.creative_id === creative)
              }
              onClick={() => {
                dirty.current = true;
                setItems((current) => [
                  ...current,
                  {
                    id: crypto.randomUUID(),
                    creative_id: creative,
                    is_enabled: true,
                    starts_at: '',
                    ends_at: '',
                  },
                ]);
                setCreative('');
              }}
            >
              {copy.addItem}
            </Button>
          </div>
          {items.length ? (
            <ReorderableList
              items={items}
              disabled={save.isPending}
              label={copy.itemsTitle}
              handleLabel={() => copy.order}
              upLabel={() => copy.moveUp}
              downLabel={() => copy.moveDown}
              onMove={(id, targetId) => {
                dirty.current = true;
                setItems((current) => {
                  const next = [...current];
                  const from = next.findIndex((item) => item.id === id);
                  const to = next.findIndex((item) => item.id === targetId);
                  const [moved] = next.splice(from, 1);
                  next.splice(to, 0, moved);
                  return next;
                });
              }}
              renderItem={(item, index, controls, handle) => (
                <div className="grid gap-4 border-b border-secondary p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {handle}
                    <span className="min-w-0 flex-1 text-sm font-medium text-primary wrap-anywhere">
                      {item.creative_id}
                    </span>
                    {controls}
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={save.isPending}
                      onClick={() => {
                        void removeItem(item);
                      }}
                    >
                      {copy.removeItem}
                    </Button>
                  </div>
                  <Switch
                    label={copy.is_enabled}
                    checked={item.is_enabled}
                    disabled={save.isPending}
                    onChange={(event) =>
                      change(item.id, { is_enabled: event.target.checked })
                    }
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field labelText={copy.starts_at}>
                      <Input
                        type="datetime-local"
                        aria-invalid={invalid}
                        aria-describedby={
                          invalid ? 'placement-items-error' : undefined
                        }
                        value={item.starts_at}
                        disabled={save.isPending}
                        aria-label={copy.starts_at}
                        onChange={(event) =>
                          change(item.id, { starts_at: event.target.value })
                        }
                      />
                    </Field>
                    <Field labelText={copy.ends_at}>
                      <Input
                        type="datetime-local"
                        aria-invalid={invalid}
                        aria-describedby={
                          invalid ? 'placement-items-error' : undefined
                        }
                        value={item.ends_at}
                        disabled={save.isPending}
                        aria-label={copy.ends_at}
                        onChange={(event) =>
                          change(item.id, { ends_at: event.target.value })
                        }
                      />
                    </Field>
                  </div>
                  <span className="sr-only">
                    {copy.range(index + 1, items.length)}
                  </span>
                </div>
              )}
            />
          ) : (
            <EmptyState title={copy.emptyTitle} description={copy.itemsHint} />
          )}
          {invalid && (
            <Message
              id="placement-items-error"
              title={copy.errorTitle}
              description={copy.validation.items}
              intent="danger"
            />
          )}
          <MutationError error={save.error} />
        </FormSection>
        <FormActions sticky={false}>
          <Button type="submit" loading={save.isPending}>
            {copy.saveItems}
          </Button>
        </FormActions>
      </form>
    </Card>
  );
}
