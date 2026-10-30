import { Input, Select, TextArea } from '@/components/ui';
import {
  gentlePathEditorialStrings as copy,
  gentlePathPortalStrings as portalCopy,
} from '@/strings';
import { ResourceCategorySchema } from '@/modules/portal/models/resource';
import type { ResourceDraft } from '../models/resourceDraft';
import type { EditorialResource } from '../models/editorialResource';
import type { EditorialFormErrors } from '../models/editorialFormErrors';
import { EditorialResourceTypeSchema } from '../models/resourceType';
import { EditorialResourceFormatSchema } from '../models/resourceFormat';
import { EditorField } from './EditorField';

const empty = '';

interface Props {
  form: ResourceDraft;
  resource?: EditorialResource;
  collections: EditorialResource[];
  errors: EditorialFormErrors;
  disabled: boolean;
  onChangeAction: (next: ResourceDraft) => void;
}
export function ResourceFields({
  form,
  resource,
  collections,
  errors,
  disabled,
  onChangeAction,
}: Props) {
  const excluded = new Set(resource ? [resource.id] : []);
  for (let pass = 0; pass < collections.length; pass++) {
    const before = excluded.size;
    for (const collection of collections)
      if (collection.parent_id && excluded.has(collection.parent_id))
        excluded.add(collection.id);
    if (excluded.size === before) break;
  }
  return (
    <div className="grid min-w-0 gap-4">
      <EditorField
        id="editorial-title"
        label={copy.titleLabel}
        error={errors.title}
      >
        <Input
          value={form.title}
          maxLength={500}
          disabled={disabled}
          onChange={(event) =>
            onChangeAction({ ...form, title: event.target.value })
          }
        />
      </EditorField>
      <EditorField
        id="editorial-description"
        label={copy.descriptionLabel}
        error={errors.description}
      >
        <TextArea
          value={form.description}
          maxLength={20000}
          disabled={disabled}
          onChange={(event) =>
            onChangeAction({ ...form, description: event.target.value })
          }
        />
      </EditorField>
      <div className="grid gap-4 sm:grid-cols-2">
        <EditorField
          id="editorial-type"
          label={copy.typeLabel}
          error={errors.type}
        >
          <Select
            value={form.type}
            disabled={disabled}
            onValueChange={(value) =>
              onChangeAction({
                ...form,
                type: EditorialResourceTypeSchema.parse(value),
              })
            }
          >
            {EditorialResourceTypeSchema.options.map((value) => (
              <option
                key={value}
                value={value}
                disabled={Boolean(
                  resource?.children_count && value !== 'COLLECTION',
                )}
              >
                {copy.types[value]}
              </option>
            ))}
          </Select>
        </EditorField>
        <EditorField
          id="editorial-format"
          label={copy.formatLabel}
          error={errors.format}
        >
          <Select
            value={form.format}
            disabled={disabled}
            onValueChange={(value) =>
              onChangeAction({
                ...form,
                format: value
                  ? EditorialResourceFormatSchema.parse(value)
                  : empty,
              })
            }
          >
            <option value={empty}>{copy.noFormat}</option>
            {EditorialResourceFormatSchema.options.map((value) => (
              <option key={value} value={value}>
                {copy.formats[value]}
              </option>
            ))}
          </Select>
        </EditorField>
      </div>
      <EditorField
        id="editorial-parent_id"
        label={copy.parentLabel}
        hint={copy.parentHint}
        error={errors.parent_id}
      >
        <Select
          value={form.parentId}
          disabled={disabled}
          onValueChange={(parentId) => onChangeAction({ ...form, parentId })}
        >
          <option value={empty}>{copy.noParent}</option>
          {collections
            .filter((collection) => !excluded.has(collection.id))
            .map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.title}
              </option>
            ))}
        </Select>
      </EditorField>
      <EditorField id="editorial-url" label={copy.linkLabel} error={errors.url}>
        <Input
          type="url"
          value={form.url}
          maxLength={1000}
          disabled={disabled}
          onChange={(event) =>
            onChangeAction({ ...form, url: event.target.value })
          }
        />
      </EditorField>
      <EditorField
        id="editorial-tags"
        label={copy.tagsLabel}
        hint={copy.tagsHint}
        error={errors.tags}
      >
        <Input
          value={form.tags}
          maxLength={3058}
          disabled={disabled}
          onChange={(event) =>
            onChangeAction({ ...form, tags: event.target.value })
          }
        />
      </EditorField>
      <div className="grid gap-4 sm:grid-cols-2">
        <EditorField id="editorial-category" label={copy.categoryLabel}>
          <Select
            value={form.category}
            disabled={disabled}
            onValueChange={(category) =>
              onChangeAction({
                ...form,
                category: ResourceCategorySchema.parse(category),
              })
            }
          >
            {ResourceCategorySchema.options.map((value) => (
              <option key={value} value={value}>
                {portalCopy.resources.categories[value]}
              </option>
            ))}
          </Select>
        </EditorField>
        <EditorField
          id="editorial-minutes"
          label={copy.minutesLabel}
          error={errors.minutes}
        >
          <Input
            type="number"
            min={0}
            max={1440}
            value={form.minutes}
            disabled={disabled}
            onChange={(event) =>
              onChangeAction({ ...form, minutes: event.target.value })
            }
          />
        </EditorField>
      </div>
    </div>
  );
}
