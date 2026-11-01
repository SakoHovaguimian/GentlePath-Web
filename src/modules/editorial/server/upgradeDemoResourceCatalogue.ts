import 'server-only';
import { gentlePathDemoStrings, gentlePathEditorialStrings } from '@/strings';
import { normalizeContentTags } from '@/utils/normalizeContentTag';
import type { DemoEditorialState } from '../models/demoEditorialState';
import type { EditorialResource } from '../models/editorialResource';
import {
  createDemoResourceCatalogue,
  demoResourceCatalogueVersion,
} from './demoResourceCatalogue';

function isUneditedOriginalSeed(resource: EditorialResource, index: number) {
  const content = gentlePathDemoStrings.resourceSeeds[index];
  if (!content) return false;
  const categories = [
    'everyday',
    'education',
    'communication',
    'wellbeing',
    'everyday',
    'wellbeing',
  ] as const;
  const types = [
    'GUIDE',
    'TOOLKIT',
    'ARTICLE',
    'GUIDE',
    'TOOLKIT',
    'ARTICLE',
  ] as const;
  const category = categories[index];
  const legacyParent =
    category === 'everyday'
      ? '38000000-0000-4000-8000-000000000001'
      : category === 'communication'
        ? '38000000-0000-4000-8000-000000000002'
        : null;
  const metadata = resource.resource_details.additional_properties;
  const elapsed =
    Date.parse(resource.updated_at) - Date.parse(resource.created_at);
  // Older fixtures used equal timestamps; the previous catalogue staggered creation
  // dates by the original index. Staff writes change the update/review timestamps.
  const originalTimestamps =
    resource.updated_at === resource.resource_details.reviewed_at &&
    (elapsed === 0 || Math.abs(elapsed - (index + 1) * 86400000) < 1000);
  const originalTags = normalizeContentTags([category]);
  const actualTags = normalizeContentTags(resource.tags);
  return (
    originalTimestamps &&
    resource.title === content.title &&
    resource.description === content.description &&
    resource.type === types[index] &&
    resource.format === 'WEB_PAGE' &&
    resource.url === null &&
    (resource.parent_id === null || resource.parent_id === legacyParent) &&
    actualTags.length === 1 &&
    actualTags[0] === originalTags[0] &&
    resource.resource_details.source_name ===
      gentlePathEditorialStrings.demo.sourceName &&
    resource.resource_details.source_url ===
      gentlePathEditorialStrings.demo.sourceUrl &&
    resource.resource_details.source_published_at === null &&
    Object.keys(metadata).length === 3 &&
    metadata.body === content.body &&
    metadata.family_category === category &&
    metadata.estimated_minutes === 3 + index
  );
}

/** Upgrade a retained preview once without replacing edits or clearing tombstones. */
export function upgradeDemoResourceCatalogue(
  state: DemoEditorialState,
  reviewer: string,
  now: string,
) {
  if ((state.resourceCatalogueVersion ?? 0) >= demoResourceCatalogueVersion)
    return;
  const existing = new Map(
    state.resources.map((resource) => [resource.id, resource]),
  );
  for (const seed of createDemoResourceCatalogue(reviewer, now)) {
    if (state.deletedResources.has(seed.id)) continue;
    const resource = existing.get(seed.id);
    if (!resource) {
      state.resources.push(seed);
      continue;
    }
    const originalIndex = /^resource-([1-6])$/.exec(resource.id);
    if (
      originalIndex &&
      isUneditedOriginalSeed(resource, Number(originalIndex[1]) - 1)
    ) {
      resource.parent_id = seed.parent_id;
      resource.tags = seed.tags;
    }
  }
  state.resourceCatalogueVersion = demoResourceCatalogueVersion;
}
