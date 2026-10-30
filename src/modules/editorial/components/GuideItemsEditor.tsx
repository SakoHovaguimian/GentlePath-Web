import {
  Button,
  Input,
  ReorderableList,
  TextArea,
  UiIcon,
} from '@/components/ui';
import { gentlePathEditorialStrings as copy } from '@/strings';
import { emptyGuideItem, type GuideDraftItem } from '../models/guideDraft';
import type { EditorialFormErrors } from '../models/editorialFormErrors';
import { EditorField } from './EditorField';
import { SourceFields } from './SourceFields';
import { MetadataField } from './MetadataField';

interface Props {
  items: GuideDraftItem[];
  errors: EditorialFormErrors;
  disabled: boolean;
  onChangeAction: (items: GuideDraftItem[]) => void;
}
export function GuideItemsEditor({
  items,
  errors,
  disabled,
  onChangeAction,
}: Props) {
  const update = (id: string, patch: Partial<GuideDraftItem>) =>
    onChangeAction(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  const position = (item: GuideDraftItem) =>
    items.findIndex((candidate) => candidate.id === item.id) + 1;
  return (
    <div className="grid min-w-0 gap-4" id="editorial-items">
      <ReorderableList
        variant="cards"
        items={items}
        disabled={disabled}
        label={copy.itemsTitle}
        handleLabel={(item) => copy.dragStep(position(item))}
        upLabel={(item) => copy.moveUp(position(item))}
        downLabel={(item) => copy.moveDown(position(item))}
        onMove={(id, targetId) => {
          const next = [...items];
          const from = next.findIndex((item) => item.id === id);
          const to = next.findIndex((item) => item.id === targetId);
          if (from < 0 || to < 0) return;
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          onChangeAction(next);
        }}
        renderItem={(item, index, controls, handle) => {
          const prefix = `items.${index}`;
          const inputId = (key: string) => `editorial-items-${index}-${key}`;
          return (
            <div className="grid min-w-0 gap-5 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {handle}
                  <h3 className="m-0 text-sm font-semibold text-primary">
                    {copy.stepLabel(index + 1)}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {controls}
                  <Button
                    variant="destructive"
                    disabled={disabled || items.length === 1}
                    onClick={() =>
                      onChangeAction(
                        items.filter((candidate) => candidate.id !== item.id),
                      )
                    }
                  >
                    <UiIcon name="trash" />
                    {copy.removeItem}
                  </Button>
                </div>
              </div>
              <EditorField
                id={inputId('title')}
                label={copy.stepTitleLabel}
                error={errors[`${prefix}.title`]}
              >
                <Input
                  value={item.title}
                  maxLength={500}
                  disabled={disabled}
                  onChange={(event) =>
                    update(item.id, { title: event.target.value })
                  }
                />
              </EditorField>
              <EditorField
                id={inputId('description')}
                label={copy.stepBodyLabel}
                error={errors[`${prefix}.description`]}
              >
                <TextArea
                  rows={6}
                  value={item.description}
                  maxLength={20000}
                  disabled={disabled}
                  onChange={(event) =>
                    update(item.id, { description: event.target.value })
                  }
                />
              </EditorField>
              <EditorField
                id={inputId('image_url')}
                label={copy.imageLabel}
                hint={copy.imageHint}
                error={errors[`${prefix}.image_url`]}
              >
                <Input
                  type="url"
                  value={item.imageUrl}
                  maxLength={1000}
                  disabled={disabled}
                  onChange={(event) =>
                    update(item.id, { imageUrl: event.target.value })
                  }
                />
              </EditorField>
              <details
                open={
                  Object.keys(errors).some((key) =>
                    key.startsWith(`${prefix}.additional_properties.source`),
                  )
                    ? true
                    : undefined
                }
                className="rounded-lg border border-secondary p-4"
              >
                <summary className="cursor-pointer text-sm font-medium text-secondary outline-none focus-visible:ring-4 focus-visible:ring-brand/12">
                  {copy.sourceTitle}
                </summary>
                <div className="mt-4 grid gap-4">
                  <p className="m-0 text-xs text-tertiary">
                    {copy.stepSourceHint}
                  </p>
                  <SourceFields
                    value={item}
                    prefix={`${prefix}.additional_properties`}
                    errors={errors}
                    disabled={disabled}
                    onChangeAction={(source) => update(item.id, source)}
                  />
                </div>
              </details>
              <MetadataField
                id={inputId('additional_properties')}
                value={item.metadataText}
                error={errors[`${prefix}.additional_properties`]}
                disabled={disabled}
                onChangeAction={(metadataText) =>
                  update(item.id, { metadataText })
                }
              />
            </div>
          );
        }}
      />
      {errors.items && (
        <p role="alert" className="m-0 text-sm text-error-primary">
          {errors.items}
        </p>
      )}
      <Button
        variant="secondary"
        className="justify-self-start"
        disabled={disabled || items.length >= 100}
        onClick={() => {
          onChangeAction([...items, emptyGuideItem()]);
          requestAnimationFrame(() =>
            document
              .getElementById(`editorial-items-${items.length}-title`)
              ?.focus(),
          );
        }}
      >
        <UiIcon name="plus" />
        {copy.addItem}
      </Button>
    </div>
  );
}
