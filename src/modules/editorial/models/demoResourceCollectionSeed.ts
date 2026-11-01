import type {
  Resource,
  ResourceCategory,
} from '@/modules/portal/models/resource';

export interface DemoResourceCollectionSeed {
  id: string;
  category: ResourceCategory;
  content: Pick<Resource, 'title' | 'description'>;
  tags: readonly string[];
  resources: readonly Pick<Resource, 'title' | 'description' | 'body'>[];
}
