import { normalizeContentTags } from '@/utils/normalizeContentTag';
import 'server-only';
import { demoMedia } from '@/services/demo/demoMedia';
import { getDemoPortalState } from '@/services/demo/demoPortalState';
import { getDemoState } from '@/services/demo/demoState';
import { gentlePathEditorialStrings as copy } from '@/strings';
import type { DemoEditorialState } from '../models/demoEditorialState';
import { mapEditorialResourceToPortal } from '../services/mapEditorialResourceToPortal';
import { getDemoResourceRatingSummaries } from '@/modules/engagement/demo/engagementState';
import {
  createDemoResourceCatalogue,
  demoResourceCatalogueVersion,
} from './demoResourceCatalogue';
import { upgradeDemoResourceCatalogue } from './upgradeDemoResourceCatalogue';

const globalEditorial = globalThis as typeof globalThis & {
  gentlePathEditorialState?: DemoEditorialState;
};

function createState(): DemoEditorialState {
  const now = new Date().toISOString();
  const reviewer =
    getDemoState().users.find((user) => user.role === 'admin')?.id ?? '';
  const resources = createDemoResourceCatalogue(reviewer, now);
  const guides = copy.demo.guides.map((seed, index) => {
    const id = `36000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    return {
      id,
      content_type: 'GUIDED_STEP' as const,
      title: seed.title,
      description: seed.description,
      image_url: null,
      created_at: now,
      updated_at: now,
      items: seed.items.map((item, position) => ({
        id: `37000000-0000-4000-8000-${String(index * 100 + position + 1).padStart(12, '0')}`,
        guided_step_id: id,
        position,
        title: item.title,
        description: item.description,
        image_url: [
          demoMedia.transition,
          demoMedia.connection,
          demoMedia.reading,
        ][(index + position) % 3],
        additional_properties: {
          source_name: copy.demo.sourceName,
          source_url: copy.demo.sourceUrl,
        },
        created_at: now,
        updated_at: now,
      })),
    };
  });
  return {
    resources,
    guides,
    deletedResources: new Set(),
    deletedGuides: new Set(),
    resourceCatalogueVersion: demoResourceCatalogueVersion,
  };
}

export function getDemoEditorialState(): DemoEditorialState {
  const state = (globalEditorial.gentlePathEditorialState ??= createState());
  upgradeDemoResourceCatalogue(
    state,
    getDemoState().users.find((user) => user.role === 'admin')?.id ?? '',
    new Date().toISOString(),
  );
  for (const record of state.resources)
    record.tags = normalizeContentTags(record.tags);
  return state;
}

export function getVisibleDemoResources() {
  const state = getDemoEditorialState();
  const visible = (id: string, visited = new Set<string>()): boolean => {
    if (visited.has(id) || state.deletedResources.has(id)) return false;
    visited.add(id);
    const resource = state.resources.find((item) => item.id === id);
    return Boolean(
      resource && (!resource.parent_id || visible(resource.parent_id, visited)),
    );
  };
  const resources = state.resources.filter((resource) => visible(resource.id));
  const ratingSummaries = getDemoResourceRatingSummaries();
  return resources.map((resource) => ({
    ...resource,
    ratings: ratingSummaries.get(resource.id) ?? { count: 0, average: null },
    children_count: resources.filter((item) => item.parent_id === resource.id)
      .length,
  }));
}

export function getVisibleDemoGuides() {
  const state = getDemoEditorialState();
  return state.guides.filter((guide) => !state.deletedGuides.has(guide.id));
}

export function syncDemoPortalResources() {
  getDemoPortalState().resources = getVisibleDemoResources().map((resource) =>
    mapEditorialResourceToPortal(resource, false),
  );
}

export function resetDemoEditorialState() {
  delete globalEditorial.gentlePathEditorialState;
}
