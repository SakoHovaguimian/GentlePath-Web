import type { z } from 'zod';
import { gentlePathEditorialStrings as copy } from '@/strings';
import {
  ContentMetadataSchema,
  type ContentMetadata,
} from '../models/contentMetadata';
import { ResourceDetailsInputSchema } from '../models/resourceDetails';
import { GuideInputSchema, type GuideInput } from '../models/guide';
import type { GuideDraft } from '../models/guideDraft';
import type { ResourceDraft } from '../models/resourceDraft';
import {
  EditorialResourceInputSchema,
  type EditorialResourceInput,
} from '../models/editorialResource';
import type {
  EditorialFormErrors,
  EditorialValidation,
} from '../models/editorialFormErrors';

function parseMetadata(
  text: string,
  path: string,
  errors: EditorialFormErrors,
): ContentMetadata {
  try {
    const result = ContentMetadataSchema.safeParse(JSON.parse(text || '{}'));
    if (result.success) return result.data;
  } catch {
    /* Show a catalog-backed validation message. */
  }
  errors[path] = copy.validation.metadataDescription;
  return {};
}
function issuesToErrors(
  issues: z.core.$ZodIssue[],
  errors: EditorialFormErrors,
  prefix = '',
) {
  for (const issue of issues) {
    let key = [prefix, ...issue.path].filter((part) => part !== '').join('.');
    if (key.startsWith('tags.')) key = 'tags';
    errors[key] ??= issue.message;
  }
}

export function validateGuideDraft(
  draft: GuideDraft,
): EditorialValidation<GuideInput> {
  const errors: EditorialFormErrors = {};
  const items = draft.items.map((item, index) => {
    const source = ResourceDetailsInputSchema.safeParse({
      source_name: item.sourceName.trim() || null,
      source_url: item.sourceUrl.trim() || null,
      source_published_at: item.sourceDate || null,
    });
    if (!source.success)
      issuesToErrors(
        source.error.issues,
        errors,
        `items.${index}.additional_properties`,
      );
    if (item.sourceDate > new Date().toISOString().slice(0, 10))
      errors[`items.${index}.additional_properties.source_published_at`] =
        copy.validation.dateDescription;
    const metadata = parseMetadata(
      item.metadataText,
      `items.${index}.additional_properties`,
      errors,
    );
    return {
      id: item.persistedId,
      title: item.title.trim() || null,
      description: item.description,
      image_url: item.imageUrl.trim() || null,
      additional_properties: {
        ...metadata,
        ...(item.sourceName.trim()
          ? { source_name: item.sourceName.trim() }
          : {}),
        ...(item.sourceUrl.trim() ? { source_url: item.sourceUrl.trim() } : {}),
        ...(item.sourceDate ? { source_published_at: item.sourceDate } : {}),
      },
    };
  });
  const result = GuideInputSchema.safeParse({
    title: draft.title,
    description: draft.description,
    image_url: draft.imageUrl.trim() || null,
    items,
  });
  if (!result.success) issuesToErrors(result.error.issues, errors);
  return {
    data:
      result.success && !Object.keys(errors).length ? result.data : undefined,
    errors,
  };
}

export function validateResourceDraft(
  draft: ResourceDraft,
): EditorialValidation<EditorialResourceInput> {
  const errors: EditorialFormErrors = {};
  const metadata = parseMetadata(
    draft.metadataText,
    'resource_details.additional_properties',
    errors,
  );
  const minutes = Number(draft.minutes);
  if (
    !draft.minutes.trim() ||
    !Number.isFinite(minutes) ||
    minutes < 0 ||
    minutes > 1440
  )
    errors.minutes = copy.validation.minutesDescription;
  const result = EditorialResourceInputSchema.safeParse({
    title: draft.title,
    description: draft.description,
    type: draft.type,
    format: draft.format || null,
    parent_id: draft.parentId || null,
    url: draft.url.trim() || null,
    tags: draft.tags
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    resource_details: {
      source_name: draft.sourceName.trim() || null,
      source_url: draft.sourceUrl.trim() || null,
      source_published_at: draft.sourceDate || null,
      additional_properties: {
        ...metadata,
        family_category: draft.category,
        estimated_minutes: minutes,
      },
    },
  });
  if (!result.success) issuesToErrors(result.error.issues, errors);
  return {
    data:
      result.success && !Object.keys(errors).length ? result.data : undefined,
    errors,
  };
}

export function focusEditorialError(errors: EditorialFormErrors) {
  const first = Object.keys(errors)[0];
  if (!first) return;
  queueMicrotask(() => {
    const target = document.getElementById(
      `editorial-${first.replaceAll('.', '-')}`,
    );
    const control = target?.matches('input,textarea,button')
      ? target
      : target?.querySelector('input,textarea,button');
    (control as HTMLElement | null)?.focus();
  });
}
