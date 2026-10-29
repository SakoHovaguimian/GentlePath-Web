import type { EditorialResource } from './editorialResource';
import type { Guide } from './guide';

export interface DemoEditorialState {
  resources: EditorialResource[];
  guides: Guide[];
  deletedResources: Set<string>;
  deletedGuides: Set<string>;
}
